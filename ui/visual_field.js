import { BasicPhyObject } from "../phy/PhyObjects/basic.js";
import { getZoomLevel, render_area } from "../sim/render_frame.js";
import * as Noti from "./notification/notification.js";
import { World } from "../phy/World.js";
import { t } from "../i18n/i18n.js";

/**
 * Coordinate System Notes:
 * - Math coordinates: Y-axis points upward (standard mathematical convention)
 * - CG coordinates: Y-axis points downward (computer graphics convention)
 * - Conversion: CG_Y = revY(-Math_Y) = -Math_Y
 * 
 * All physics calculations use Math coordinates.
 * All DOM/CSS positioning uses CG coordinates.
 * SVG rendering uses CG coordinates but handles conversion internally.
 */

function revY(y) {
    // convert from cartesian y to screen y
    // not a typo. this function is just a marker for readability
    return y;
}

const visualFieldCover = document.getElementById("visualField-cover");
const simAnchor = document.getElementById("simulation-area-anchor");

function showVisualFieldCover() {
    visualFieldCover.style.display = "block";
    if (simAnchor) {
        simAnchor.style.filter = "grayscale(100%) opacity(0.3)";
    }
}

function hideVisualFieldCover() {
    visualFieldCover.style.display = "none";
    if (simAnchor) {
        simAnchor.style.filter = "none";
    }
}

// 创建假物体用于计算
const fake_po = new BasicPhyObject(new World(), 1, [0, 0], [0, 0], [], []);

/**
 * 计算指定位置的力场强度和方向
 * @param {Object} world - 世界对象
 * @param {string} ff_id - 力场ID
 * @param {Array} position - 位置坐标 [x, y]
 * @returns {Array} 力矢量 [fx, fy] 或 null
 */
function calculateForceAtPosition(ff, position) {
    if (!ff) return null;

    // 更新假物体位置
    fake_po.pos.value = position;

    try {
        const force = ff.compute_force(fake_po, 0);
        return force;
    } catch (error) {
        // Noti.warning(t("Force Calculation Failed"), `Unable to calculate force at position [${position[0]}, ${position[1]}]`);
        console.warn(`Force calculation failed at position [${position[0]}, ${position[1]}]:`, error);
        return null;
    }
}

/**
 * 生成等势线路径
 * @param {Object} gridData - 网格数据
 * @param {number} potentialValue - 等势线的势能值
 * @returns {Array} 等势线路径数组
 */
function generateEquipotentialContours(gridData, potentialValue) {
    const { grid, bounds } = gridData;

    const contourPaths = [];

    // 使用简单的marching squares算法生成等势线
    for (let i = 1; i < grid.length; i++) {
        for (let j = 1; j < grid[i].length; j++) {
            const corners = [
                grid[i - 1][j - 1], // 左上
                grid[i][j - 1],     // 右上
                grid[i - 1][j],     // 左下
                grid[i][j]          // 右下
            ];

            // 检查这个格子是否包含等势线
            // console.log(corners, i, j)
            const values = corners.map(c => c.potential);
            const minVal = Math.min(...values);
            const maxVal = Math.max(...values);

            if (minVal <= potentialValue && potentialValue <= maxVal) {
                // 这个格子包含等势线，计算交点
                const intersections = [];

                // 检查四条边
                const edges = [
                    [corners[2], corners[3]], // 底边
                    [corners[1], corners[3]], // 右边
                    [corners[0], corners[1]], // 顶边
                    [corners[0], corners[2]]  // 左边
                ];

                edges.forEach((edge, edgeIndex) => {
                    const [p1, p2] = edge;
                    const v1 = p1.potential;
                    const v2 = p2.potential;

                    // 如果等势线穿过这条边
                    if ((v1 <= potentialValue && potentialValue <= v2) ||
                        (v2 <= potentialValue && potentialValue <= v1)) {

                        // 线性插值找到交点
                        const t = Math.abs(v2 - v1) < 1e-10 ? 0.5 : (potentialValue - v1) / (v2 - v1);
                        const x = p1.x + t * (p2.x - p1.x);
                        const y = p1.y + t * (p2.y - p1.y);

                        intersections.push({ x: x - 1, y: y - 1, edge: edgeIndex });
                    }
                });

                // 如果有两个交点，连接它们形成线段
                if (intersections.length >= 2) {
                    contourPaths.push([
                        [intersections[0].x, intersections[0].y],
                        [intersections[1].x, intersections[1].y]
                    ]);
                }
            }
        }
    }

    // console.log(contourPaths);
    return contourPaths;
}

/**
 * 绘制等势面到SVG
 * @param {Array} contourLevels - 等势线级别数组
 * @param {Object} gridData - 网格数据
 * @param {Object} bounds - 显示边界
 * @returns {SVGElement} SVG元素
 */
function renderEquipotentialSurfacesToSVG(contourLevels, gridData, bounds, options = {}) {
    const { xmin, xmax, ymin, ymax } = bounds;
    const width = xmax - xmin;
    const height = ymax - ymin;
    const { useLogScale = false, colorTheme = 'blue', minVal, maxVal } = options;

    // 创建SVG元素
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // 坐标转换函数
    const scaleX = width / (xmax - xmin);
    const scaleY = height / (ymax - ymin);

    const grid = gridData.grid;
    const cols = grid.length;
    const rows = grid[0].length;
    
    // Estimate cell size from first two points
    let cellW = 20; // fallback
    let cellH = 20;
    if (cols > 1) cellW = (grid[1][0].x - grid[0][0].x) * scaleX;
    if (rows > 1) cellH = Math.abs((grid[0][1].y - grid[0][0].y) * scaleY); // Y is flipped?

    // Color Interpolator (Opacity based)
    function getColor(val) {
        let t = 0;
        const range = maxVal - minVal;

        if (Math.abs(range) < 1e-9) {
            t = 0.5;
        } else {
            if (useLogScale) {
                // Exponential Mode: Logarithmic scaling
                let norm = (val - minVal) / range;
                norm = Math.max(0, Math.min(1, norm));
                
                // Log mapping
                const C = 100;
                t = Math.log(norm * C + 1) / Math.log(C + 1);
            } else {
                // Linear Mode: Strictly Linear Scaling (No Log)
                t = (val - minVal) / range;
            }
        }
        t = Math.max(0, Math.min(1, t));

        // Use Opacity for Gradient
        // High Potential -> 50% Opacity (0.5)
        // Low Potential -> 0% Opacity (0.0)
        
        const opacity = t * 0.7; // Max 0.5

        if (colorTheme === 'red') {
             // Red Base: rgb(255, 0, 0)
             return `rgba(255, 0, 0, ${opacity.toFixed(3)})`;
        } else {
             // Blue Base: rgb(0, 0, 255)
             return `rgba(0, 0, 255, ${opacity.toFixed(3)})`;
        }
    }

    // 1. Render Heatmap Background (Interpolated Canvas)
    // Create a temporary canvas to render the grid points
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');

    // Fill canvas pixels
    for(let i=0; i<cols; i++){
        for(let j=0; j<rows; j++){
             const cell = grid[i][j];
             if(!cell) continue;
             
             ctx.fillStyle = getColor(cell.potential);
             // Canvas (0,0) is Top-Left.
             // Grid (i, j) corresponds to World X (i) and World Y (j)
             // World Y=0 is Bottom. So we map grid j (0..rows-1) to canvas y (rows-1..0)
             ctx.fillRect(i, rows - 1 - j, 1, 1);
        }
    }
    
    // Convert to Data URL
    const imgData = canvas.toDataURL("image/png");
    
    // Create SVG Image element to stretch this heatmap over the view
    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    
    // Map Canvas boundaries to SVG Viewport
    // Grid covers physical width: (cols-1) * cellW. 
    // Image covers pixels (cols) * cellW.
    // SVG x=0 is aligned with Grid i=0.
    // We center the pixels on the grid points.
    // Pixel 0 center is at 0.5. Grid 0 is at 0.
    // So Image Start X = -0.5 * cellW
    
    const imgX = -0.5 * cellW;
    const imgY = height - (rows - 0.5) * cellH; // Align image bottom with grid bottom + half cell
    
    const imgW = cols * cellW;
    const imgH = rows * cellH;

    image.setAttribute("href", imgData);
    image.setAttribute("x", imgX);
    image.setAttribute("y", imgY);
    image.setAttribute("width", imgW);
    image.setAttribute("height", imgH);
    image.setAttribute("preserveAspectRatio", "none");
    // Ensure smoothing (browser default usually bilinearly interpolates images upon scaling)
    image.style.imageRendering = "auto"; 
    
    svg.appendChild(image);

    function worldToScreen(mathWorldX, mathWorldY) {
        const screenX = (mathWorldX - xmin) * scaleX;
        const screenY = height - (mathWorldY - ymin) * scaleY; // Flip Y
        return [screenX, screenY];
    }

    // 2. Render Contours (Overlay)
    // 生成颜色映射
    // Simplified contours for overlay (e.g. white or black lines)
    const contourColor = (colorTheme === 'red') ? "rgba(255, 255, 200, 0.5)" : "rgba(200, 255, 255, 0.5)";

    contourLevels.forEach((potentialValue, levelIndex) => {
        const contourPaths = generateEquipotentialContours(gridData, potentialValue);
        
        contourPaths.forEach(path => {
            if (path.length < 2) return;

            const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

            const [startX, startY] = worldToScreen(path[0][0], path[0][1]);
            const [endX, endY] = worldToScreen(path[1][0], path[1][1]);
            let d = `M ${startX} ${startY}`;
            for(let k=1; k<path.length; k++){
                const [px, py] = worldToScreen(path[k][0], path[k][1]);
                d += ` L ${px} ${py}`;
            }

            svgPath.setAttribute("d", d);
            svgPath.setAttribute("stroke", contourColor);
            svgPath.setAttribute("stroke-width", "1");
            svgPath.setAttribute("fill", "none");
            svg.appendChild(svgPath);
        });
    });

    return svg;
}

function generateAdaptiveStartPoints(bounds, gridResolution = 20) {
    const startPoints = [];
    const { xmin, xmax, ymin, ymax } = bounds;

    const stepX = (xmax - xmin) / gridResolution;
    const stepY = (ymax - ymin) / gridResolution;

    // 生成均匀网格点
    for (let i = 0; i <= gridResolution; i++) {
        for (let j = 0; j <= gridResolution; j++) {
            const x = xmin + i * stepX;
            const y = ymin + j * stepY;
            startPoints.push([x, y]);
        }
    }

    return startPoints;
}

/**
 * 追踪单条力场线
 * @param {Object} world - 世界对象
 * @param {string} ff_id - 力场ID
 * @param {Array} startPoint - 起始点 [x, y]
 * @param {Object} options - 追踪选项
 * @returns {Array} 力场线上的点数组
 */
function traceFieldLine(world, ff_id, startPoint, options = {}) {
    const {
        maxSteps = 1000,        // 最大步数
        stepSize = 0.1,         // 步长
        minForce = 1e-6,        // 最小力阈值
        maxDistance = 100,      // 最大追踪距离
        bounds = null           // 边界限制
    } = options;

    const linePoints = [];
    let currentPoint = [...startPoint];
    let currentPoint_mathcoord = [currentPoint[0] / getZoomLevel(), currentPoint[1] / getZoomLevel()];
    let totalDistance = 0;

    for (let step = 0; step < maxSteps; step++) {
        // 计算当前位置的力
        const force = calculateForceAtPosition(world.ffs[ff_id], currentPoint_mathcoord);

        if (!force || !Array.isArray(force) || force.length < 2) {
            break;
        }

        const fx = force[0];
        const fy = force[1];
        const forceMagnitude = Math.sqrt(fx * fx + fy * fy);

        // 如果力太小，停止追踪
        if (forceMagnitude < minForce) {
            break;
        }

        // 记录当前点
        linePoints.push([...currentPoint]);

        // 计算下一步方向（归一化力方向）
        const directionX = fx / forceMagnitude;
        const directionY = fy / forceMagnitude;

        // 自适应步长：力越大步长越小
        var adaptiveStepSize = Math.min(stepSize, stepSize / (1 + forceMagnitude * 0.1));
        adaptiveStepSize = Math.max(adaptiveStepSize, stepSize * 0.1); // 设置最小步长限制

        // 移动到下一点
        const nextX = currentPoint[0] + directionX * adaptiveStepSize;
        const nextY = currentPoint[1] + directionY * adaptiveStepSize;

        // 检查边界
        if (bounds) {
            if (nextX < bounds.xmin || nextX > bounds.xmax ||
                nextY < bounds.ymin || nextY > bounds.ymax) {
                break;
            }
        }

        currentPoint = [nextX, nextY];
        totalDistance += adaptiveStepSize;

        // 检查最大距离
        if (totalDistance > maxDistance) {
            break;
        }
    }

    return linePoints;
}

/**
 * 优化力场线分布 - 移除过于密集的线
 * @param {Array} fieldLines - 所有力场线
 * @param {number} minDistance - 线之间的最小距离
 * @returns {Array} 优化后的力场线
 */
function optimizeFieldLineDistribution(fieldLines, minDistance = 2.0) {
    if (fieldLines.length === 0) return [];

    const optimizedLines = [fieldLines[0]]; // 保留第一条线

    for (let i = 1; i < fieldLines.length; i++) {
        const currentLine = fieldLines[i];
        if (currentLine.length === 0) continue;

        const startPoint = currentLine[0];
        let tooClose = false;

        // 检查与已保留线的距离
        for (const existingLine of optimizedLines) {
            if (existingLine.length === 0) continue;

            const existingStart = existingLine[0];
            const distance = Math.sqrt(
                Math.pow(startPoint[0] - existingStart[0], 2) +
                Math.pow(startPoint[1] - existingStart[1], 2)
            );

            if (distance < minDistance) {
                tooClose = true;
                break;
            }
        }

        if (!tooClose) {
            optimizedLines.push(currentLine);
        }
    }

    return optimizedLines;
}

/**
 * 绘制力场矢量箭头到SVG
 * @param {Array} vectors - 矢量数组 [{x, y, fx, fy, magnitude}]
 * @param {Object} bounds - 显示边界
 * @param {number} maxMagnitude - 最大场强
 * @param {number} maxArrowLength - 最大箭头长度
 * @param {boolean} useLogScale - 是否使用对数刻度
 * @returns {SVGElement} SVG元素
 */
function renderFieldVectorsToSVG(vectors, bounds, maxMagnitude, maxArrowLength, useLogScale = false) {
    const { xmin, xmax, ymin, ymax } = bounds;
    const width = xmax - xmin;
    const height = ymax - ymin;

    // 创建SVG元素
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // 坐标转换函数
    const scaleX = width / (xmax - xmin);
    const scaleY = height / (ymax - ymin);

    function worldToScreen(mathWorldX, mathWorldY) {
        const screenX = (mathWorldX - xmin) * scaleX;
        const screenY = height - (mathWorldY - ymin) * scaleY; // 翻转Y轴
        return [screenX, screenY];
    }

    const minMagnitude = vectors.reduce((min, vec) => vec.magnitude < min ? vec.magnitude : min, Infinity);
    const logBase = Math.min(minMagnitude > 0 ? minMagnitude : 1e-9, 1e-9);

    vectors.forEach(vec => {
        const { x, y, fx, fy, magnitude } = vec;

        // 计算箭头长度
        let length;
        if (useLogScale) {
            const logVal = Math.log10(magnitude);
            const logMax = Math.log10(maxMagnitude);
            const logMin = Math.log10(logBase);

            // 归一化到 0-1
            // Range: logMin ... logMax
            // val = (logVal - logMin) / (logMax - logMin)
            const range = logMax - logMin;
            if (range > 0) {
                length = ((logVal - logMin) / range) * maxArrowLength;
            } else {
                length = maxArrowLength;
            }
        } else {
            // 线性刻度
            length = (magnitude / maxMagnitude) * maxArrowLength;
        }

        // 限制最小最大长度
        length = Math.max(0, Math.min(length, maxArrowLength));

        if (length < 1) return; // 忽略太短的箭头

        // 计算屏幕坐标
        const [screenX, screenY] = worldToScreen(x, y);

        // 计算箭头方向 (注意fy需要反转，因为SVG Y轴向下)
        const angle = Math.atan2(-fy, fx);

        const endX = screenX + Math.cos(angle) * length;
        const endY = screenY + Math.sin(angle) * length;

        // 颜色设置
        // 红色为指数/对数模式，蓝色为线性模式
        const color = useLogScale ? "#cc0000" : "#0066cc";

        // 绘制箭头主线
        const path = document.createElementNS("http://www.w3.org/2000/svg", "line");
        path.setAttribute("x1", screenX);
        path.setAttribute("y1", screenY);
        path.setAttribute("x2", endX);
        path.setAttribute("y2", endY);
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("stroke-opacity", "0.8");
        svg.appendChild(path);

        // 绘制箭头头部
        const arrowHeadSize = Math.min(4, length * 0.4);
        const arrowAngle = Math.PI / 6; // 30度

        const headX1 = endX - arrowHeadSize * Math.cos(angle - arrowAngle);
        const headY1 = endY - arrowHeadSize * Math.sin(angle - arrowAngle);
        const headX2 = endX - arrowHeadSize * Math.cos(angle + arrowAngle);
        const headY2 = endY - arrowHeadSize * Math.sin(angle + arrowAngle);

        const headPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        headPath.setAttribute("d", `M ${endX} ${endY} L ${headX1} ${headY1} M ${endX} ${endY} L ${headX2} ${headY2}`);
        headPath.setAttribute("stroke", color);
        headPath.setAttribute("stroke-width", "1.5");
        headPath.setAttribute("stroke-opacity", "0.8");
        headPath.setAttribute("fill", "none");
        svg.appendChild(headPath);
    });

    return svg;
}

/* 
    Visualize FF (Force Line) - Updated Logic
*/
function visualize_ff_FL(world, ff_id) {
    fake_po.world.vars = world.vars; // sync vars

    const ff = world.ffs[ff_id];
    if (!ff) {
        Noti.error(t("Force Field Not Found"), `No force field found with ID: ${ff_id}`);
        console.error("Force field not found:", ff_id);
        return;
    }

    // 根据当前可视区域计算世界坐标边界
    const bounds = {
        xmin: render_area[0],
        xmax: render_area[1],
        ymin: render_area[2],
        ymax: render_area[3]
    };

    const gridSpacing = 20; // 20px interval
    const maxArrowLength = gridSpacing / 2; // Max length 10px

    const vectors = [];
    let maxMagnitude = 0;
    let minMagnitude = Infinity;
    let sumMagnitude = 0;

    // 遍历网格点
    // 既然bounds就是pixel units (zoomed world)，我们直接按gridSpacing遍历
    const startX = Math.ceil(bounds.xmin / gridSpacing) * gridSpacing;
    const startY = Math.ceil(bounds.ymin / gridSpacing) * gridSpacing;

    const zoom = getZoomLevel();

    for (let x = startX; x <= bounds.xmax; x += gridSpacing) {
        for (let y = startY; y <= bounds.ymax; y += gridSpacing) {
            // 转换为物理坐标用于计算
            const mathX = x / zoom;
            const mathY = y / zoom;

            const force = calculateForceAtPosition(world.ffs[ff_id], [mathX, mathY]);

            if (force && Array.isArray(force) && force.length >= 2) {
                const fx = force[0];
                const fy = force[1];
                const magnitude = Math.sqrt(fx * fx + fy * fy);

                if (magnitude > 0) {
                    vectors.push({
                        x: x,
                        y: y,
                        fx: fx,
                        fy: fy,
                        magnitude: magnitude
                    });

                    if (magnitude > maxMagnitude) {
                        maxMagnitude = magnitude;
                    }
                    if (magnitude < minMagnitude) {
                        minMagnitude = magnitude;
                    }
                    sumMagnitude += magnitude;
                }
            }
        }
    }

    // 检测是否需要对数刻度
    // 判定条件：跨越多个数量级，即 max/min 极大
    let useLogScale = false;
    if (vectors.length > 10 && maxMagnitude > 0 && minMagnitude > 0) {
        const ratio = maxMagnitude / minMagnitude;
        // 如果比例超过1000 (3个数量级)，并且均值远小于最大值
        const avgMagnitude = sumMagnitude / vectors.length;
        if (ratio > 1000 && (maxMagnitude / avgMagnitude) > 20) {
            useLogScale = true;
            // Noti.info(t("Exponential Field Detected"), "Using logarithmic scale (red arrows) for visualization.");
        }
    }

    // 清除之前的内容
    visualFieldCover.innerHTML = '';

    if (vectors.length > 0 && maxMagnitude > 0) {
        // 渲染力场矢量
        const svg = renderFieldVectorsToSVG(vectors, bounds, maxMagnitude, maxArrowLength, useLogScale);
        visualFieldCover.appendChild(svg);
    } else {
        Noti.info(t("No Force Field Detected"), "Field strength is zero in the current view.");
    }

    // 显示覆盖层
    showVisualFieldCover();
}

function calcU(ff, p1, p2) {
    var force = calculateForceAtPosition(ff, p1);
    if (!force) return 0;

    var dr = [p2[0] - p1[0], p2[1] - p1[1]];

    // U = -F·dr
    var dot = force[0] * dr[0] + force[1] * dr[1];
    var U = -dot;

    return U;
}

/*
    Visualize FF (Equal Potential Surface) - Poisson Relaxation Method
*/
function visualize_ff_EPS(world, ff_id) {
    fake_po.world.vars = world.vars; // sync vars

    const ff = world.ffs[ff_id];
    if (!ff) {
        Noti.error(t("Force Field Not Found"), `No force field found with ID: ${ff_id}`);
        console.error("Force field not found:", ff_id);
        return;
    }

    // 根据当前可视区域计算世界坐标边界
    const bounds = {
        xmin: render_area[0],
        xmax: render_area[1],
        ymin: render_area[2],
        ymax: render_area[3]
    };

    const zoom = getZoomLevel();
    // Grid Setup
    const gridSizePx = 20; // grid spacing in screen pixels
    const widthPx = bounds.xmax - bounds.xmin;
    const heightPx = bounds.ymax - bounds.ymin;

    const cols = Math.ceil(widthPx / gridSizePx) + 1;
    const rows = Math.ceil(heightPx / gridSizePx) + 1;

    // Physics step size
    const h = gridSizePx / zoom;

    // 1. Precompute Forces
    const forceGrid = []; // [col][row] -> [fx, fy]

    for (let i = 0; i < cols; i++) {
        forceGrid[i] = [];
        for (let j = 0; j < rows; j++) {
            const screenX = bounds.xmin + i * gridSizePx;
            const screenY = bounds.ymin + j * gridSizePx;

            // Convert to Physics Coordinates
            // Note: render_area y is already consistent with internal logic, 
            // but we need to divide by zoom.
            const mathX = screenX / zoom;
            const mathY = screenY / zoom;

            const f = calculateForceAtPosition(ff, [mathX, mathY]);
            if (f && Array.isArray(f) && f.length >= 2) {
                forceGrid[i][j] = f;
            } else {
                forceGrid[i][j] = [0, 0];
            }
        }
    }

    // 2. Helper function to solve Poisson with fixed sweep direction
    // "Four-Direction Averaging" Strategy:
    // Run solver 4 times, starting from each corner (TL, TR, BL, BR),
    // then average the results. This cancels out directional bias completely.
    const solvePoissonDirectional = (dirX, dirY) => {
        // init local grid
        const pGrid = [];
        for (let i = 0; i < cols; i++) {
            pGrid[i] = new Float64Array(rows).fill(0);
        }

        const iterations = 180;

        for (let iter = 0; iter < iterations; iter++) {

            const startI = (dirX > 0) ? 0 : cols - 1;
            const endI = (dirX > 0) ? cols : -1;
            const stepI = (dirX > 0) ? 1 : -1;

            const startJ = (dirY > 0) ? 0 : rows - 1;
            const endJ = (dirY > 0) ? rows : -1;
            const stepJ = (dirY > 0) ? 1 : -1;

            for (let i = startI; i !== endI; i += stepI) {
                for (let j = startJ; j !== endJ; j += stepJ) {
                    let sum = 0;
                    let count = 0;

                    // F current
                    const F_c = forceGrid[i][j];

                    // Right Neighbor (i+1)
                    if (i < cols - 1) {
                        const U_n = pGrid[i + 1][j];
                        const F_n = forceGrid[i + 1][j];
                        // U_c ~= U_n + F_mid_x * h
                        const F_mid_x = (F_c[0] + F_n[0]) * 0.5;
                        sum += U_n + F_mid_x * h;
                        count++;
                    }

                    // Left Neighbor (i-1)
                    if (i > 0) {
                        const U_n = pGrid[i - 1][j];
                        const F_n = forceGrid[i - 1][j];
                        // U_c ~= U_n - F_mid_x * h
                        const F_mid_x = (F_c[0] + F_n[0]) * 0.5;
                        sum += U_n - F_mid_x * h;
                        count++;
                    }

                    // Top Neighbor (j+1)
                    if (j < rows - 1) {
                        const U_n = pGrid[i][j + 1];
                        const F_n = forceGrid[i][j + 1];
                        // U_c ~= U_n + F_mid_y * h
                        const F_mid_y = (F_c[1] + F_n[1]) * 0.5;
                        sum += U_n + F_mid_y * h;
                        count++;
                    }

                    // Bottom Neighbor (j-1)
                    if (j > 0) {
                        const U_n = pGrid[i][j - 1];
                        const F_n = forceGrid[i][j - 1];
                        // U_c ~= U_n - F_mid_y * h
                        const F_mid_y = (F_c[1] + F_n[1]) * 0.5;
                        sum += U_n - F_mid_y * h;
                        count++;
                    }

                    if (count > 0) {
                        const targetVal = sum / count;
                        // SOR Update
                        const oldVal = pGrid[i][j];
                        // Use omega = 1.6 for faster convergence (must be < 2)
                        pGrid[i][j] = oldVal + 1.6 * (targetVal - oldVal);
                    }
                }
            }
        }
        return pGrid;
    };

    // 3. Relaxation (Poisson Solver)
    // Run 4 independent solvers from 4 corners and average results
    // To ensure linearity for uniform fields, we need FULL convergence.
    // Averaging opposite corners (TL+BR) is sufficient for symmetry if converged.
    // Using all 4 is safer but slower.
    const pGridTL = solvePoissonDirectional(1, 1);
    const pGridTR = solvePoissonDirectional(-1, 1);
    const pGridBL = solvePoissonDirectional(1, -1);
    const pGridBR = solvePoissonDirectional(-1, -1);

    const potentialGrid = [];
    for (let i = 0; i < cols; i++) {
        potentialGrid[i] = new Float64Array(rows);
        for (let j = 0; j < rows; j++) {
            const avg = (pGridTL[i][j] + pGridBR[i][j]) * 0.5; // Average of two opposite corners to cancel bias
            potentialGrid[i][j] = avg;
        }
    }
    for (let j = 0; j < rows; j++) {
        console.log(`Column i=0, j=${j}: potential=${potentialGrid[0][j]}`);
    }

    // 4. Format Data
    let minPotential = Infinity;
    let maxPotential = -Infinity;
    let sumPotential = 0;
    let countValues = 0;
    const grid = [];

    for (let i = 0; i < cols; i++) {
        const rowData = [];
        for (let j = 0; j < rows; j++) {
            const worldX = bounds.xmin + i * gridSizePx;
            const worldY = bounds.ymin + j * gridSizePx;
            const potential = potentialGrid[i][j];

            rowData.push({
                x: worldX,
                y: worldY,
                potential: potential
            });

            if (potential < minPotential) minPotential = potential;
            if (potential > maxPotential) maxPotential = potential;
            sumPotential += potential;
            countValues++;
        }
        grid.push(rowData);
    }

    // Auto-detect Exponential / Singularity (Skewness check)
    let useLog = false;
    let colorTheme = 'blue';

    const range = maxPotential - minPotential;
    if (range > 1e-9 && countValues > 10) {
        const avg = sumPotential / countValues;
        const normalizedMean = (avg - minPotential) / range;
        
        // If distribution is highly skewed (mean is close to min or max), treat as exponential
        // Standard Linear distribution has mean ~ 0.5
        if(normalizedMean < 0.2 || normalizedMean > 0.8) {
            useLog = true;
            colorTheme = 'red';
        }
    }

    const gridData = {
        grid: grid,
        bounds: bounds,
        minPotential: minPotential,
        maxPotential: maxPotential,
        referencePoint: [bounds.xmin, bounds.ymin]
    };

    console.log(`EPS (Poisson): Range ${minPotential.toExponential(2)} ~ ${maxPotential.toExponential(2)}. LogMode: ${useLog}`);

    // Dynamic contour selection
    const contourLevels = [];
    const numContours = 15;
    const step = range / numContours;
    for (let k = 0; k <= numContours; k++) {
        contourLevels.push(minPotential + k * step);
    }

    // 清除之前的内容
    visualFieldCover.innerHTML = '';

    // 渲染等势面
    const svg = renderEquipotentialSurfacesToSVG(contourLevels, gridData, bounds, {
        useLogScale: useLog,
        colorTheme: colorTheme,
        minVal: minPotential,
        maxVal: maxPotential
    });
    visualFieldCover.appendChild(svg);
    
    // 显示覆盖层
    showVisualFieldCover();
}

export { showVisualFieldCover, hideVisualFieldCover, visualize_ff_FL, visualize_ff_EPS };