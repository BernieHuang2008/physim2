import { t } from '../i18n/i18n.js';
import { math } from '../phyEngine/math.js';
import { showContextMenu } from './menu.js';
import UIControls from './controls/controls.js';
import { FakeVarFromFunction } from '../phy/FakeVarFromFunction.js';
import { globalWorld } from '../phy/World.js';
import { UI_Section } from './ui_section/ui_section.js';
import { $, $$ } from '../utils.js';

var liveMonitorData = {};
var liveMonitorPlots = {};
window.liveMonitorData = liveMonitorData;

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
    const itemPlot = liveMonitorPlots[id];
    const display = item.meta.display;
    const plotDiv = itemPlot.plotDiv;
    const infoDiv = plotDiv.parentElement.querySelector('.live-monitor-info');

    // a one-time UI section for editing info
    var section_info = new UI_Section(t("[Monitor]") + " " + (item.meta.title || t("Untitled")) + " - " + t("Info"));

    section_info.on["activate"]["adjust_window_display"] = () => {
        // Set initial position and size
        if (display.pos) {
            section_info.dom.style.left = (display.pos[0] || 0) + 'px';
            section_info.dom.style.top = (display.pos[1] || 0) + 'px';
        }
        if (display.size) {
            section_info.dom.style.width = (display.size[0] || 400) + 'px';
            section_info.dom.style.height = (display.size[1] || 300) + 'px';
        }
    }

    section_info.activateAt($("#center-bar"));

    // fake vars
    const fakeVar_expression = new FakeVarFromFunction(() => null, "Live Monitor Expr Var", null, globalWorld);
    fakeVar_expression.type = "derived";
    fakeVar_expression.expression = item.meta.expr;
    fakeVar_expression.update_expression = function (newExpr) {
        item.meta.expr = newExpr;
        fakeVar_expression.expression = newExpr;
    };

    const fakeVar_title = new FakeVarFromFunction(() => null, "Live Monitor Title Var", null, globalWorld);
    fakeVar_title.type = "immediate";
    fakeVar_title._value = item.meta.title;
    fakeVar_title.update = function (newTitle) {
        fakeVar_title._value = newTitle;
        item.meta.title = newTitle;
    };

    // build section
    section_info
        .addHeadlessSubsection()
        .addUIControl(UIControls.InputControls.InputNormal, {
            field: t('Title'),
            variable: fakeVar_title,
            onChange: (variable, newValue) => {
                // itemPlot.section.setTitle(t("[Monitor]") + " " + (newValue || t("Untitled")));
            }
        })
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t('Expression'),
            variable: fakeVar_expression,
            onChange: (variable, newValue) => {
                item.data.time = [];
                item.data.value = [];
            }
        })
        .render();

    section_info.activate(itemPlot.section);

    // Override drag/resize handlers to save state
    const oldDragEnd = section_info._onDragEnd.bind(section_info);
    section_info._onDragEnd = (e) => {
        oldDragEnd(e);
        display.pos = [section_info.dom.offsetLeft, section_info.dom.offsetTop];
    };
    const oldResizeEnd = section_info._onResizeEnd.bind(section_info);
    section_info._onResizeEnd = (e) => {
        oldResizeEnd(e);
        display.size = [section_info.dom.offsetWidth, section_info.dom.offsetHeight];
    };
}

function _createPlotlyPlot(id) {
    const item = liveMonitorData[id];
    const display = item.meta.display;

    // Create UI Section
    let title = "placeholder";
    let section = new UI_Section(title);

    section.on["activate"]["adjust_window_display"] = () => {
        // set title
        section.setTitle(t("[Monitor]") + " " + (item.meta.title || t("Untitled")));
        // Set initial position and size
        if (display.pos) {
            section.dom.style.left = (display.pos[0] || 0) + 'px';
            section.dom.style.top = (display.pos[1] || 0) + 'px';
        }
        if (display.size) {
            section.dom.style.width = (display.size[0] || 400) + 'px';
            section.dom.style.height = (display.size[1] || 300) + 'px';
        }
    }

    // Override deactivate to clean up
    section.on["deactivate"]["if_close_then_cleanup"] = (msg = null) => {
        if (msg === "CLOSE") {
            delete liveMonitorData[id];
            delete liveMonitorPlots[id];
        }
    };

    // Bind to center-bar
    section.activateAt(document.getElementById("center-bar"));

    // Override drag/resize handlers to save state
    const oldDragEnd = section._onDragEnd.bind(section);
    section._onDragEnd = (e) => {
        oldDragEnd(e);
        display.pos = [section.dom.offsetLeft, section.dom.offsetTop];
    };

    const oldResizeEnd = section._onResizeEnd.bind(section);
    section._onResizeEnd = (e) => {
        oldResizeEnd(e);
        display.size = [section.dom.offsetWidth, section.dom.offsetHeight];
        Plotly.Plots.resize(plotDiv);
    };

    // Add '...' menu button to title bar
    let titleBar = section.dom.querySelector('.ui-section-title');
    let closeBtn = titleBar.querySelector('#close-btn');

    let moreBtn = document.createElement('span');
    moreBtn.textContent = '⋯';
    moreBtn.className = 'symbol float-right';
    moreBtn.style.cursor = 'pointer';
    moreBtn.style.fontWeight = 'bold';
    moreBtn.style.marginRight = '3ch';
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
    // Insert before close button
    titleBar.insertBefore(moreBtn, closeBtn);

    // Content
    let contentContainer = section.dom_content;

    // Plot Content Area
    let plotDiv = document.createElement('div');
    plotDiv.className = 'live-monitor-content';
    plotDiv.style.width = '100%';
    plotDiv.style.height = '100%';
    contentContainer.appendChild(plotDiv);

    // Edit Info Area (Hidden by default)
    let infoDiv = document.createElement('div');
    infoDiv.className = 'live-monitor-info';
    infoDiv.style.display = 'none';
    contentContainer.appendChild(infoDiv);

    Plotly.newPlot(plotDiv, [{
        x: item.data.time,
        y: item.data.value,
        mode: 'scatter',
    }], SETTINGS.plotly_layout, SETTINGS.plotly_config);

    // Initial resize to fit container
    requestAnimationFrame(() => {
        Plotly.Plots.resize(plotDiv);
    });

    return {
        section: section,
        plotDiv: plotDiv
    };
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
        item.data.value.push(val);
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
        let plotDiv = liveMonitorPlots[id].plotDiv;

        Plotly.react(plotDiv, [{
            x: [...item.data.time],
            y: item.data.value,
            type: 'scatter'
        }], SETTINGS.plotly_layout, SETTINGS.plotly_config);
    }
}

export { liveMonitorData, livemon_add, livemon_reset, livemon_report_ff, livemon_report_vars, livemon_report_simend, livemon_update_frame };