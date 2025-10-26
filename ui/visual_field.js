import { BasicPhyObject } from "../phy/PhyObjects/basic.js";
import { getZoomLevel, render_area } from "../sim/render_frame.js";

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

function showVisualFieldCover() {
    visualFieldCover.style.display = "block";
}

function hideVisualFieldCover() {
    visualFieldCover.style.display = "none";
}

// 创建假物体用于计算
const fake_po = new BasicPhyObject({ add: () => { }, vars: [] }, 1, [0, 0], [0, 0], [], []);

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
function renderEquipotentialSurfacesToSVG(contourLevels, gridData, bounds) {
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

    // 生成颜色映射
    const colors = [
        "#0000CC", "#1155DD", "#2266EE", "#0033AA", "#004499", 
        "#333333", 
        "#CC3300", "#DD4411", "#EE5522", "#FF0000", "#AA1100"
    ];

    // 为每个等势线级别绘制轮廓
    contourLevels.forEach((potentialValue, levelIndex) => {
        const contourPaths = generateEquipotentialContours(gridData, potentialValue);
        const color = colors[levelIndex % colors.length];

        contourPaths.forEach(path => {
            if (path.length < 2) return;

            const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

            const [startX, startY] = worldToScreen(path[0][0], path[0][1]);
            const [endX, endY] = worldToScreen(path[1][0], path[1][1]);

            const pathData = `M ${startX} ${startY} L ${endX} ${endY}`;

            svgPath.setAttribute("d", pathData);
            svgPath.setAttribute("stroke", color);
            svgPath.setAttribute("stroke-width", "2");
            svgPath.setAttribute("fill", "none");
            svgPath.setAttribute("stroke-opacity", "0.8");

            // 添加势能值标签（只为一些线段添加）
            if (levelIndex % 2 === 0 && Math.random() < 0.1) {
                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", midX);
                text.setAttribute("y", midY);
                text.setAttribute("font-size", "10");
                text.setAttribute("fill", color);
                text.setAttribute("text-anchor", "middle");
                text.textContent = potentialValue.toFixed(1);

                svg.appendChild(text);
            }

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
 * 绘制力场线到SVG
 * @param {Array} fieldLines - 力场线数组
 * @param {Object} bounds - 显示边界
 * @returns {SVGElement} SVG元素
 */
function renderFieldLinesToSVG(fieldLines, bounds) {
    const { xmin, xmax, ymin, ymax } = bounds;
    const width = xmax - xmin;
    const height = ymax - ymin;

    // 创建SVG元素
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    // svg.style.background = "rgba(255, 255, 255, 0.9)";

    // 坐标转换函数
    const scaleX = width / (xmax - xmin);
    const scaleY = height / (ymax - ymin);

    function worldToScreen(mathWorldX, mathWorldY) {
        const screenX = (mathWorldX - xmin) * scaleX;
        // 将数学世界坐标转换为SVG屏幕坐标
        // SVG坐标系：原点在左上角，Y向下为正
        // 数学坐标系：Y向上为正
        const screenY = height - (mathWorldY - ymin) * scaleY; // 翻转Y轴使数学坐标适配SVG
        return [screenX, screenY];
    }

    // 绘制每条力场线
    fieldLines.forEach((line, index) => {
        if (line.length < 2) return;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let pathData = "";

        line.forEach((point, pointIndex) => {
            const [screenX, screenY] = worldToScreen(point[0], point[1]);
            if (pointIndex === 0) {
                pathData += `M ${screenX} ${screenY}`;
            } else {
                pathData += ` L ${screenX} ${screenY}`;
            }
        });

        path.setAttribute("d", pathData);
        path.setAttribute("stroke", "#0066cc");
        path.setAttribute("stroke-width", "1.5");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-opacity", "0.8");

        // 添加箭头标记
        if (line.length >= 2) {
            const lastPoint = line[line.length - 1];
            const secondLastPoint = line[line.length - 2];
            const [lastX, lastY] = worldToScreen(lastPoint[0], lastPoint[1]);
            const [secondLastX, secondLastY] = worldToScreen(secondLastPoint[0], secondLastPoint[1]);

            // 计算箭头方向
            const dx = lastX - secondLastX;
            const dy = lastY - secondLastY;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length > 0) {
                const arrowSize = 8;
                const unitX = dx / length;
                const unitY = dy / length;

                // 箭头两边的点
                const arrowX1 = lastX - arrowSize * unitX - arrowSize * 0.5 * unitY;
                const arrowY1 = lastY - arrowSize * unitY + arrowSize * 0.5 * unitX;
                const arrowX2 = lastX - arrowSize * unitX + arrowSize * 0.5 * unitY;
                const arrowY2 = lastY - arrowSize * unitY - arrowSize * 0.5 * unitX;

                const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                arrowPath.setAttribute("d", `M ${lastX} ${lastY} L ${arrowX1} ${arrowY1} M ${lastX} ${lastY} L ${arrowX2} ${arrowY2}`);
                arrowPath.setAttribute("stroke", "#0066cc");
                arrowPath.setAttribute("stroke-width", "1.5");
                arrowPath.setAttribute("stroke-opacity", "0.8");

                svg.appendChild(arrowPath);
            }
        }

        svg.appendChild(path);
    });

    return svg;
}

/* 
    Visualize FF (Force Line)
*/
function visualize_ff_FL(world, ff_id) {
    fake_po.world.vars = world.vars; // sync vars

    const ff = world.ffs[ff_id];
    if (!ff) {
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
    // console.log("计算得到的可视边界:", bounds);

    // 生成起始点
    const startPoints = generateAdaptiveStartPoints(bounds, 15);

    // 追踪所有力场线
    const fieldLines = [];
    const traceOptions = {
        maxSteps: 500,
        stepSize: 0.5,
        minForce: 1e-4,
        maxDistance: 200,
        bounds: bounds
    };

    // console.log(`开始计算 ${startPoints.length} 条力场线...`);

    startPoints.forEach((startPoint, index) => {
        const line = traceFieldLine(world, ff_id, startPoint, traceOptions);
        if (line.length > 1) {
            fieldLines.push(line);
        }
    });

    // console.log(`计算完成，共生成 ${fieldLines.length} 条有效力场线`);

    // 优化线的分布
    const optimizedLines = optimizeFieldLineDistribution(fieldLines, 3.0);
    // console.log(`优化后保留 ${optimizedLines.length} 条力场线`);

    // 清除之前的内容
    visualFieldCover.innerHTML = '';

    // 渲染力场线
    const svg = renderFieldLinesToSVG(optimizedLines, bounds);
    visualFieldCover.appendChild(svg);

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
    Visualize FF (Equal Potential Surface)
*/
function visualize_ff_EPS(world, ff_id) {
    fake_po.world.vars = world.vars; // sync vars

    const ff = world.ffs[ff_id];
    if (!ff) {
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
    // console.log("计算等势面边界:", bounds);

    // 生成势能网格数据
    const gridResolution = 30; // 较低分辨率以提高性能

    // Create matrix directly with size (xmax-xmin)/gridResolution
    const matrixWidth = Math.ceil((bounds.xmax - bounds.xmin) / gridResolution);
    const matrixHeight = Math.ceil((bounds.ymax - bounds.ymin) / gridResolution);
    const potentialMatrix = Array(matrixWidth).fill(null).map(() => Array(matrixHeight).fill(0));   // size: [w][h]

    if (!potentialMatrix || potentialMatrix.length === 0) {
        console.warn("无法计算势能数据");
        return;
    }

    // calculate potential matrix
    // reference point
    potentialMatrix[0][0] = 0;
    // first row & column
    for (let i = 1; i < matrixWidth; i++) {
        var mathX = (bounds.xmin + i * gridResolution) / getZoomLevel();
        potentialMatrix[i][0] = potentialMatrix[i - 1][0] + calcU(ff, [mathX - gridResolution/getZoomLevel(), 0], [mathX, 0]);

        var mathY = (bounds.ymin + i * gridResolution) / getZoomLevel();
        potentialMatrix[0][i] = potentialMatrix[0][i - 1] + calcU(ff, [0, mathY - gridResolution/getZoomLevel()], [0, mathY]);
    }
    // remainings
    for (let x = 1; x < matrixWidth; x++) {
        for (let y = 1; y < matrixHeight; y++) {
            const mathX = (bounds.xmin + x * gridResolution) / getZoomLevel();
            const mathY = (bounds.ymin + y * gridResolution) / getZoomLevel();

            potentialMatrix[x][y]
                = potentialMatrix[x - 1][y]
                + calcU(ff, [mathX - gridResolution/getZoomLevel(), mathY], [mathX, mathY]);
        }
    }

    // Convert potential matrix to gridData format and find min/max values
    let minPotential = Infinity;
    let maxPotential = -Infinity;
    const grid = [];

    for (let i = 0; i < matrixWidth; i++) {
        const row = [];
        for (let j = 0; j < matrixHeight; j++) {
            const worldX = bounds.xmin + i * gridResolution;
            const worldY = bounds.ymin + j * gridResolution;
            const potential = potentialMatrix[i][j];

            row.push({
                x: worldX,
                y: worldY,
                potential: potential
            });

            minPotential = Math.min(minPotential, potential);
            maxPotential = Math.max(maxPotential, potential);
        }
        grid.push(row);
    }

    const gridData = {
        grid: grid,
        bounds: bounds,
        minPotential: minPotential,
        maxPotential: maxPotential,
        referencePoint: [bounds.xmin, bounds.ymin]
    };

    console.log(`势能范围: ${minPotential.toFixed(3)} 到 ${maxPotential.toFixed(3)}`);

    // 生成等势线级别
    const numContours = 10;
    // const potentialRange = gridData.maxPotential - gridData.minPotential;
    const potentialRange = Math.log(gridData.maxPotential - gridData.minPotential);
    const contourStep = potentialRange / numContours;

    const contourLevels = [];
    for (let i = 1; i < numContours; i++) {
        contourLevels.push(gridData.minPotential + Math.exp(i * contourStep));
        // contourLevels.push(gridData.minPotential + i * contourStep);
    }

    console.log(`生成 ${contourLevels.length} 条等势线，范围: ${gridData.minPotential.toFixed(3)} 到 ${gridData.maxPotential.toFixed(3)}`);

    // 清除之前的内容
    visualFieldCover.innerHTML = '';

    // 渲染等势面
    const svg = renderEquipotentialSurfacesToSVG(contourLevels, gridData, bounds);
    visualFieldCover.appendChild(svg);

    // 显示覆盖层
    showVisualFieldCover();
}

export { showVisualFieldCover, hideVisualFieldCover, visualize_ff_FL, visualize_ff_EPS };