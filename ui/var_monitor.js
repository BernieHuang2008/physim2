import { t } from '../i18n/i18n.js';
import { math } from '../phyEngine/math.js';
import { showContextMenu } from './menu.js';
import UIControls from './controls/controls.js';
import { FakeVarFromFunction } from '../phy/FakeVarFromFunction.js';
import { globalWorld } from '../phy/World.js';
import { UI_Section } from './ui_section/ui_section.js';
import { $, $$ } from '../utils.js';

var varMonitorData = {};
window.varMonitorData = varMonitorData;

var current_time = -1;
var current_time_ff_data = {};
var current_time_var_data = {};

class VarMonitor {
    constructor({id, title, exprX, exprY, annoX, annoY, axis_match = false}) {
        this.id = id;
        this.meta = {
            id: id,
            title: title,
            annoX: annoX,
            annoY: annoY,
            exprX: exprX,
            exprY: exprY,
            display: {
                pos: [0, 0],
                size: [600, 400],
                disp_type: "plotly/scatter",
                axis_match: axis_match,
            },
            datatype: "REAL",
        };
        this.data = {
            time: [],
            valueX: [],
            valueY: [],
        };

        this.gen_config();
        this.createPlotlyPlot();
    }

    gen_config() {
        // plotly layout
        this.plotly_layout = {
            margin: { t: 0, r: 0, b: 0, l: 0 },
            xaxis: { title: { text: this.meta.annoX }, automargin: true },
            yaxis: { title: { text: this.meta.annoY }, automargin: true},
            autosize: true,
        };

        if (this.meta.display.axis_match) {
            this.plotly_layout.yaxis.scaleanchor = 'x';
            this.plotly_layout.yaxis.scaleratio = 1;
        }

        // plotly config
        this.plotly_config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };
    }

    createPlotlyPlot() {
        const display = this.meta.display;

        // Create UI Section
        let title = "placeholder";
        this.section = new UI_Section(title);

        this.section.on["activate"]["adjust_window_display"] = () => {
            // set title
            this.section.setTitle(t("[Monitor]") + " " + (this.meta.title || t("Untitled")));
            // Set initial position and size
            if (display.pos) {
                this.section.dom.style.left = (display.pos[0] || 0) + 'px';
                this.section.dom.style.top = (display.pos[1] || 0) + 'px';
            }
            if (display.size) {
                this.section.dom.style.width = (display.size[0] || 400) + 'px';
                this.section.dom.style.height = (display.size[1] || 300) + 'px';
            }
        }

        // Override deactivate to clean up
        this.section.on["deactivate"]["if_close_then_cleanup"] = (msg = null) => {
            if (msg === "CLOSE") {
                delete varMonitorData[this.id];
            }
        };

        // Bind to center-bar
        this.section.activateAt(document.getElementById("center-bar"));

        // Override drag/resize handlers to save state
        const oldDragEnd = this.section._onDragEnd.bind(this.section);
        this.section._onDragEnd = (e) => {
            oldDragEnd(e);
            display.pos = [this.section.dom.offsetLeft, this.section.dom.offsetTop];
        };

        const oldResizeEnd = this.section._onResizeEnd.bind(this.section);
        this.section._onResizeEnd = (e) => {
            oldResizeEnd(e);
            display.size = [this.section.dom.offsetWidth, this.section.dom.offsetHeight];
            Plotly.Plots.resize(this.plotDiv);
        };

        // Add '...' menu button to title bar
        let titleBar = this.section.dom.querySelector('.ui-section-title');
        let closeBtn = titleBar.querySelector('#close-btn');

        let moreBtn = document.createElement('span');
        moreBtn.textContent = '⋯';
        moreBtn.className = 'symbol float-right';
        moreBtn.style.cursor = 'pointer';
        moreBtn.style.fontWeight = 'bold';
        moreBtn.style.marginRight = '3ch';
        moreBtn.addEventListener('mousedown', (e) => e.stopPropagation()); // Prevent drag
        moreBtn.onclick = () => {
            showContextMenu([
                {
                    type: "submenu",
                    title: t("Info"),
                    action: () => this.editInfo()
                }
            ], moreBtn);
        };
        // Insert before close button
        titleBar.insertBefore(moreBtn, closeBtn);

        // Content
        let contentContainer = this.section.dom_content;

        // Plot Content Area
        this.plotDiv = document.createElement('div');
        this.plotDiv.className = 'var-monitor-content';
        this.plotDiv.style.width = '100%';
        this.plotDiv.style.height = '100%';
        contentContainer.appendChild(this.plotDiv);

        // Edit Info Area (Hidden by default)
        let infoDiv = document.createElement('div');
        infoDiv.className = 'var-monitor-info';
        infoDiv.style.display = 'none';
        contentContainer.appendChild(infoDiv);

        Plotly.newPlot(this.plotDiv, [{
            x: this.data.valueX,
            y: this.data.valueY,
            mode: 'scatter',
        }], this.plotly_layout, this.plotly_config);

        // Initial resize to fit container
        requestAnimationFrame(() => {
            Plotly.Plots.resize(this.plotDiv);
        });
    }

    editInfo() {
        const display = this.meta.display;

        // a one-time UI section for editing info
        var section_info = new UI_Section(t("[Monitor]") + " " + (this.meta.title || t("Untitled")) + " - " + t("Info"));

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

        section_info.on["deactivate"]["return_to_plotly"] = (msg) => {
            if (msg === "RETURN_TO_PREVIOUS_SECTION") {
                this.gen_config();
                this.updateFrame();
            }
        }

        section_info.activateAt($("#center-bar"));

        // fake vars
        const fakeVar_expression_x = new FakeVarFromFunction(() => null, "Var Monitor Expr Var X", null, globalWorld);
        fakeVar_expression_x.type = "derived";
        fakeVar_expression_x.expression = this.meta.exprX;
        fakeVar_expression_x.update_expression = (newExpr) => {
            // update expr
            this.meta.exprX = newExpr;
            fakeVar_expression_x.expression = newExpr;
            // clear existing data to avoid confusion
            this.data.time = [];
            this.data.valueY = [];
            this.data.valueX = [];
        };

        const fakeVar_expression_y = new FakeVarFromFunction(() => null, "Var Monitor Expr Var Y", null, globalWorld);
        fakeVar_expression_y.type = "derived";
        fakeVar_expression_y.expression = this.meta.exprY;
        fakeVar_expression_y.update_expression = (newExpr) => {
            // update expr
            this.meta.exprY = newExpr;
            fakeVar_expression_y.expression = newExpr;
            // clear existing data to avoid confusion
            this.data.time = [];
            this.data.valueY = [];
            this.data.valueX = [];
        };

        const fakeVar_title = new FakeVarFromFunction(() => null, "Var Monitor Title Var", null, globalWorld);
        fakeVar_title.type = "immediate";
        fakeVar_title._value = this.meta.title;
        fakeVar_title.update = (newTitle) => {
            fakeVar_title._value = newTitle;
            this.meta.title = newTitle;
            this.section.setTitle(t("[Monitor]") + " " + (newTitle || t("Untitled")));
        };

        // build section
        section_info
            .addHeadlessSubsection()
            .addUIControl(UIControls.InputControls.InputNormal, {
                field: t('Title'),
                variable: fakeVar_title
            })
            .addUIControl(UIControls.InputControls.InputNormal, {
                field: t('X-axis Annotation'),
                variable: new FakeVarFromFunction(() => this.meta.annoX, "Var Monitor Axis X Title", null, null),
                onChange: (variable, newValue) => {
                    this.meta.annoX = newValue;
                }
            })
            .addUIControl(UIControls.InputControls.InputMath, {
                field: t('Expression (X-axis)'),
                variable: fakeVar_expression_x
            })
            .addUIControl(UIControls.InputControls.InputNormal, {
                field: t('Y-axis Annotation'),
                variable: new FakeVarFromFunction(() => this.meta.annoY, "Var Monitor Axis Y Title", null, null),
                onChange: (variable, newValue) => {
                    this.meta.annoY = newValue;
                }
            })
            .addUIControl(UIControls.InputControls.InputMath, {
                field: t('Expression (Y-axis)'),
                variable: fakeVar_expression_y
            })
            .addSubsection(t("Settings"))
            .addUIControl(UIControls.InputControls.InputCheckbox, {
                field: t('Match X/Y Axis Scale'),
                variable: new FakeVarFromFunction(() => this.meta.display.axis_match, "Var Monitor Axis Match", null, null),
                onChange: (variable, newValue) => {
                    this.meta.display.axis_match = newValue;
                }
            })
            .render();

        section_info.activate(this.section);

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

    reset() {
        this.data.time = [];
        this.data.valueX = [];
        this.data.valueY = [];
    }

    evaluateAndAppend(time, scope) {
        let exprX = this.meta.exprX || "t";
        let exprY = this.meta.exprY;
        if (!exprY) return;

        let valX = math.evaluate(exprX, scope);
        let valY = math.evaluate(exprY, scope);

        // append data
        this.data.time.push(time);
        this.data.valueX.push(valX);
        this.data.valueY.push(valY);
    }

    updateFrame() {
        this.revision = (this.revision || 0) + 1;
        this.plotly_layout.datarevision = this.revision;

        Plotly.react(this.plotDiv, [{
            x: this.data.valueX,
            y: this.data.valueY,
            type: 'scatter'
        }], this.plotly_layout, this.plotly_config);
    }
}

function VarMon_add(params) {
    if (varMonitorData[params.id]) {
        return;
    }

    varMonitorData[params.id] = new VarMonitor(params);
}

function VarMon_report_ff(world, time, ff_id, value) {
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

function VarMon_report_vars(world, time, vars) {
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

function VarMon_report_simend(sim) {
    var time = sim.time;
    if (time < current_time) {
        return;
    }
    if (time > current_time) {
        current_time = time;
        current_time_ff_data = {};
        current_time_var_data = {};
    }

    let scope = Object.assign({ t: time }, current_time_ff_data, current_time_var_data);
    for (let monitor of Object.values(varMonitorData)) {
        monitor.evaluateAndAppend(time, scope);
    }
}

function VarMon_init_display() {

}

function VarMon_deinit_display() {

}

function VarMon_reset() {
    for (let monitor of Object.values(varMonitorData)) {
        monitor.reset();
    }
    current_time = -1;
}

function VarMon_update_frame() {
    VarMon_init_display();

    for (let monitor of Object.values(varMonitorData)) {
        monitor.updateFrame();
    }
}

export { VarMonitor, varMonitorData, VarMon_add, VarMon_reset, VarMon_report_ff, VarMon_report_vars, VarMon_report_simend, VarMon_update_frame };