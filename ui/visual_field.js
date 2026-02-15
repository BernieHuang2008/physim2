import { BasicPhyObject } from "../phy/PhyObjects/basic.js";
import { getZoomLevel, render_area } from "../sim/render_frame.js";
import * as Noti from "./notification/notification.js";
import { World } from "../phy/World.js";
import { Variable } from "../phy/Var.js";
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
    Noti.badgeInfoClose();
    visualFieldCover.style.display = "none";
    if (simAnchor) {
        simAnchor.style.filter = "none";
    }
}


// 创建假物体用于计算
const fake_world = new World();
const fake_po = new BasicPhyObject(fake_world, 1, [0, 0], [0, 0], [], []);
const _tmp_fake_po_vars_used_to_construct_var_list = [
    new Variable('q', 1, 'immediate'),
];
_tmp_fake_po_vars_used_to_construct_var_list.forEach(v => {
    var var_id = fake_world.add_var(v);
    fake_po.vars.push(var_id);
});
const fake_world_vars = Object.assign({}, fake_world.vars);   // backup for restoring after sync


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
    fake_world.vars = Object.assign({}, world.vars, fake_world_vars); // sync vars

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
            Noti.badgeInfo(t("Exp. Fd. Disp."), null, -1, "white", "linear-gradient(45deg, #c00, transparent)");
            // Noti.info(t("Exponential Field Detected"), "Using logarithmic scale (red arrows) for visualization.");
        }
    }
    if (!useLogScale) {
        Noti.badgeInfo(t("Linear Fd. Disp."), null, -1, "white", "linear-gradient(45deg, #06c, transparent)");
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

export { showVisualFieldCover, hideVisualFieldCover, visualize_ff_FL };