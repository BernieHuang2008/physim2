import { t } from '../i18n/i18n.js';
import { math } from '../phyEngine/math.js';
import { showContextMenu } from './menu.js';
import UIControls from './controls/controls.js';
import { FakeVarFromFunction } from '../phy/FakeVarFromFunction.js';
import { globalWorld } from '../phy/World.js';

var liveMonitorData = {};
var liveMonitorPlots = {};

var current_time = -1;
var current_time_ff_data = {};
var current_time_var_data = {};

const SETTINGS = {
    plotly_layout: {
        margin: { t: 0, r: 0, b: 0, l: 0 },
        xaxis: { title: { text: t('Time / s') }, automargin: true },
        yaxis: { title: { text: t('Value') }, automargin: true },
        autosize: true,
    },
    plotly_config: {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    },
}

function edit_info(id) {
    const item = liveMonitorData[id];
    const plotDiv = liveMonitorPlots[id];
    const infoDiv = plotDiv.parentElement.querySelector('.live-monitor-info');

    // show info section
    infoDiv.style.display = 'block';
    plotDiv.style.display = 'none';

    infoDiv.innerHTML = '';
    let title = document.createElement('h3');
    title.textContent = t('Monitor Info');
    infoDiv.appendChild(title);

    let paraId = document.createElement('p');
    paraId.textContent = t('ID') + ': ' + item.meta.id;
    infoDiv.appendChild(paraId);

    const fakeVar = new FakeVarFromFunction(() => null, "Live Monitor Expr Var", null, globalWorld);
    fakeVar.expression = item.meta.expr;
    fakeVar.update_expression = function (newExpr) {
        item.meta.expr = newExpr;
        fakeVar.expression = newExpr;
    };

    infoDiv.appendChild(UIControls.InputControls.InputMath({
        field: t('Expression'),
        variable: fakeVar,
        onChange: (variable, newValue) => {
            item.data.time = [];
            item.data.value = [];
        }
    }));

    let paraDatatype = document.createElement('p');
    paraDatatype.textContent = t('Data Type') + ': ' + item.meta.datatype;
    infoDiv.appendChild(paraDatatype);

    let btnBack = document.createElement('button');
    btnBack.textContent = t('Back');
    btnBack.onclick = () => {
        infoDiv.style.display = 'none';
        plotDiv.style.display = 'block';
    };
    infoDiv.appendChild(btnBack);
}

function _createPlotlyPlot(id) {
    const item = liveMonitorData[id];
    const display = item.meta.display;

    // Create Window Container
    let container = document.createElement('div');
    container.className = 'live-monitor-window';
    container.style.left = (display.pos[0] || 0) + 'px';
    container.style.top = (display.pos[1] || 0) + 'px';
    container.style.width = (display.size[0] || 400) + 'px';
    container.style.height = (display.size[1] || 300) + 'px';

    // Title Bar
    let titleBar = document.createElement('div');
    titleBar.className = 'live-monitor-title-bar';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';

    let titleText = document.createElement('span');
    titleText.textContent = item.meta.title || "Monitor";
    titleText.style.flexGrow = '1';
    titleText.style.overflow = 'hidden';
    titleText.style.textOverflow = 'ellipsis';
    titleBar.appendChild(titleText);

    let titleBtnContainer = document.createElement('div');
    titleBtnContainer.style.display = 'flex';
    titleBtnContainer.style.alignItems = 'center';

    let moreBtn = document.createElement('div');
    moreBtn.textContent = '...';
    moreBtn.style.cursor = 'pointer';
    moreBtn.style.padding = '0 5px';
    moreBtn.style.fontWeight = 'bold';
    moreBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // Prevent drag
    moreBtn.onclick = function () {
        showContextMenu([
            {
                type: "submenu",
                title: t("Info"),
                action: () => edit_info(id)
            }
        ], moreBtn);
    };
    titleBtnContainer.appendChild(moreBtn);

    let closeBtn = document.createElement('div');
    closeBtn.textContent = '×';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.padding = '0 5px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent drag

        delete liveMonitorData[id];
        delete liveMonitorPlots[id];
        container.remove();
    });
    titleBtnContainer.appendChild(closeBtn);

    titleBar.appendChild(titleBtnContainer);
    container.appendChild(titleBar);

    // Plot Content Area
    let plotDiv = document.createElement('div');
    plotDiv.className = 'live-monitor-content';
    container.appendChild(plotDiv);

    // Edit Info Area (Hidden by default)
    let infoDiv = document.createElement('div');
    infoDiv.className = 'live-monitor-info';
    infoDiv.style.display = 'none';
    container.appendChild(infoDiv);

    // Resize Handle
    let resizeHandle = document.createElement('div');
    resizeHandle.className = 'live-monitor-resize-handle';
    container.appendChild(resizeHandle);

    Plotly.newPlot(plotDiv, [{
        x: item.data.time,
        y: item.data.value,
        mode: 'scatter',
    }], SETTINGS.plotly_layout, SETTINGS.plotly_config);

    const sim_anchor = document.getElementById("simulation-area-anchor");
    if (sim_anchor) {
        sim_anchor.appendChild(container);
    } else {
        document.body.appendChild(container); // Fallback
    }

    // --- Dragging Logic ---
    let isDragging = false;
    let dragStartX, dragStartY, dragStartLeft, dragStartTop;

    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartLeft = container.offsetLeft;
        dragStartTop = container.offsetTop;

        e.preventDefault();
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragUp);
    });

    function onDragMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        const newLeft = dragStartLeft + dx;
        const newTop = dragStartTop + dy;

        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';

        display.pos = [newLeft, newTop];
    }

    function onDragUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragUp);
    }

    // --- Resizing Logic ---
    let isResizing = false;
    let resizeStartX, resizeStartY, resizeStartW, resizeStartH;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeStartW = container.offsetWidth;
        resizeStartH = container.offsetHeight;

        e.preventDefault();
        e.stopPropagation(); // prevent dragging from parent
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeUp);
    });

    function onResizeMove(e) {
        if (!isResizing) return;
        const dx = e.clientX - resizeStartX;
        const dy = e.clientY - resizeStartY;

        const newW = Math.max(150, resizeStartW + dx);
        const newH = Math.max(100, resizeStartH + dy);

        container.style.width = newW + 'px';
        container.style.height = newH + 'px';

        Plotly.Plots.resize(plotDiv);

        display.size = [newW, newH];
    }

    function onResizeUp() {
        isResizing = false;
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeUp);
    }

    Plotly.Plots.resize(plotDiv);

    return plotDiv;
}

function livemon_add(id, title, expr) {
    if (liveMonitorData[id]) {
        return;
    }


    liveMonitorData[id] = {
        meta: {
            id: "M_" + Math.random().toString(36).substr(2, 9),
            title: title,
            expr: expr,
            display: {
                pos: [0, 0],
                size: [600, 400],
                disp_type: "plotly/scatter",
            },
            datatype: "REAL",
        },
        data: {
            time: [],
            value: [],
        },
    };

    liveMonitorPlots[id] = _createPlotlyPlot(id);
}

function livemon_report_ff(world, time, ff_id, value) {
    if (time < current_time) {
        return;
    }
    if (time > current_time) {
        current_time = time;
        current_time_ff_data = {};
        current_time_var_data = {};
    }

    current_time_ff_data[ff_id] = value;
}

function livemon_report_vars(world, time, vars) {
    if (time < current_time) {
        return;
    }
    if (time > current_time) {
        current_time = time;
        current_time_ff_data = {};
        current_time_var_data = {};
    }

    current_time_var_data = vars;
}

function livemon_report_simend(sim) {
    var time = sim.time;
    if (time < current_time) {
        return;
    }
    if (time > current_time) {
        current_time = time;
        current_time_ff_data = {};
        current_time_var_data = {};
    }

    for (let item of Object.values(liveMonitorData)) {
        let expr = item.meta.expr;
        if (!expr) continue;

        let scope = Object.assign({ t: time }, current_time_ff_data, current_time_var_data);
        let val = math.evaluate(expr, scope);

        item.data.time.push(time);
        item.data.value.push(val[0]);
    }
}

function livemon_init_display() {

}

function livemon_deinit_display() {

}

function livemon_reset() {
    for (let item of Object.values(liveMonitorData)) {
        item.data.time = [];
        item.data.value = [];
    }
    current_time = -1;
}

function livemon_update_frame() {
    livemon_init_display();

    for (let [id, item] of Object.entries(liveMonitorData)) {
        let plotDiv = liveMonitorPlots[id];

        Plotly.react(plotDiv, [{
            x: [...item.data.time],
            y: item.data.value,
            type: 'scatter'
        }], SETTINGS.plotly_layout, SETTINGS.plotly_config);
    }
}

export { liveMonitorData, livemon_add, livemon_reset, livemon_report_ff, livemon_report_vars, livemon_report_simend, livemon_update_frame };