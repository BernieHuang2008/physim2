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

const defaultColors = ['#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];

class VarMonitor {
    constructor({ id, title, exprX, ySeries = [], annoX, annoY, axis_match = false }) {
        this.id = id;
        this.meta = {
            id: id,
            title: title,
            annoX: annoX,
            annoY: annoY,
            exprX: exprX,
            ySeries: [],
            display: {
                pos: [100, 100],
                size: [600, 400],
                disp_type: "plotly/scatter",
                axis_match: axis_match,
            },
            datatype: "REAL",
        };
        this.data = {
            time: [],
            valueX: [],
            valueY: [], // Array of arrays, one for each series
        };

        // Initialize valueY arrays for each series
        ySeries.forEach((ycfg) => this.addYSeries(ycfg));

        this.gen_config();
        this.createPlotlyPlot();
    }

    gen_config() {
        // plotly layout
        this.plotly_layout = {
            margin: { t: 0, r: 0, b: 0, l: 0 },
            xaxis: { title: { text: this.meta.annoX }, automargin: true },
            yaxis: { title: { text: this.meta.annoY }, automargin: true },
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

    addYSeries({ name = "Y" + (this.meta.ySeries.length + 1), expr = "0", color = null }) {
        if (!color) {
            color = defaultColors[this.meta.ySeries.length % defaultColors.length];
        }

        var item = {
            name: name,
            expr: expr,
            exprVar: null, // placeholder
            color: color
        };

        const fakeVar_expression_y = new FakeVarFromFunction(() => null, name, null, globalWorld);
        fakeVar_expression_y.type = "derived";
        fakeVar_expression_y.expression = item.expr;
        fakeVar_expression_y.update_expression = (newExpr) => {
            // update expr
            item.expr = newExpr;
            fakeVar_expression_y.expression = newExpr;
            // clear existing data to avoid confusion
            this.reset();
        };

        item.exprVar = fakeVar_expression_y;
        this.meta.ySeries.push(item);
        this.data.valueY.push([]);
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
        if (external_window && !external_window.closed) {
            this.section.activateAt(external_window.document.getElementById("external-center-bar"));
        } else {
            this.section.activateAt(document.getElementById("center-bar"));
        }

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
            this.editInfo();
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

        // Create plotly traces for each series
        const traces = this.meta.ySeries.map((series, index) => ({
            x: this.data.valueX,
            y: this.data.valueY[index] || [],
            mode: 'scatter',
            name: series.name,
            line: { color: series.color }
        }));

        Plotly.newPlot(this.plotDiv, traces, this.plotly_layout, this.plotly_config);

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

        if (external_window && !external_window.closed) {
            section_info.activateAt(external_window.document.getElementById("external-center-bar"));
        } else {
            section_info.activateAt(document.getElementById("center-bar"));
        }

        // fake vars
        const fakeVar_expression_x = new FakeVarFromFunction(() => null, "Var Monitor Expr Var X", null, globalWorld);
        fakeVar_expression_x.type = "derived";
        fakeVar_expression_x.expression = this.meta.exprX;
        fakeVar_expression_x.update_expression = (newExpr) => {
            // update expr
            this.meta.exprX = newExpr;
            fakeVar_expression_x.expression = newExpr;
            // clear existing data to avoid confusion
            this.reset();
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
            .addUIControl(UIControls.Tables.ColumedList, {
                field: t("Y-axis Series"),
                iterator: this.meta.ySeries,
                colums: [
                    // Col 1: Name
                    (series, index) => {
                        let span = document.createElement("span");
                        let input = document.createElement("input");
                        input.type = "text";
                        input.value = series.name;
                        input.style.width = "40px";
                        input.onchange = (e) => {
                            series.name = e.target.value;
                            this.updateFrame(); // Assuming updateFrame handles plotly layout updates if traces change
                        }
                        span.appendChild(input);
                        return span;
                    },
                    // Col 2: Expression
                    (series, index) => {
                        return UIControls.InputControls.InputMath({
                            field: "",
                            variable: series.exprVar,
                        });
                    },
                    // Col 3: Color and Delete
                    (series, index) => {
                        let span = document.createElement("span");

                        let colorInput = document.createElement("input");
                        colorInput.type = "color";
                        colorInput.value = series.color || defaultColors[index % defaultColors.length];
                        colorInput.style.marginRight = "5px";
                        colorInput.onchange = (e) => {
                            series.color = e.target.value;
                            this.updateFrame();
                        }
                        span.appendChild(colorInput);

                        const deleteBtn = document.createElement("span");
                        deleteBtn.className = "small-button symbol red alert-theme";
                        deleteBtn.innerHTML = "&#xE74D;";
                        deleteBtn.onclick = () => {
                            this.meta.ySeries.splice(index, 1);
                            this.data.valueY.splice(index, 1);
                            section_info.render();
                            this.updateFrame();
                        };
                        span.appendChild(deleteBtn);

                        return span;
                    }
                ],
                onAdd: () => {
                    const ycfg = {
                        name: "Y" + (this.meta.ySeries.length + 1),
                        expr: "0",
                        color: null
                    };
                    this.addYSeries(ycfg);
                    section_info.render();
                    this.updateFrame();
                }
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
        this.data.valueY = this.meta.ySeries.map(() => []);
    }

    evaluateAndAppend(time, scope) {
        let exprX = this.meta.exprX || "t";

        let valX = math.evaluate(exprX, scope);

        // append data
        this.data.time.push(time);
        this.data.valueX.push(valX);

        this.meta.ySeries.forEach((series, index) => {
            if (series.expr) {
                try {
                    let valY = math.evaluate(series.expr, scope);
                    this.data.valueY[index].push(valY);
                } catch (e) {
                    this.data.valueY[index].push(null);
                }
            } else {
                this.data.valueY[index].push(null);
            }
        });
    }

    updateFrame() {
        this.revision = (this.revision || 0) + 1;
        this.plotly_layout.datarevision = this.revision;

        const traces = this.meta.ySeries.map((series, index) => ({
            x: this.data.valueX,
            y: this.data.valueY[index] || [],
            type: 'scatter',
            name: series.name,
            line: { color: series.color }
        }));

        Plotly.react(this.plotDiv, traces, this.plotly_layout, this.plotly_config);
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

var external_window = null;
function VarMon_toggle_external_mode() {
    if (external_window && !external_window.closed) {
        external_window.focus();
        return;
    }

    external_window = window.open('external_var_monitor.html', '_blank', 'width=800,height=600');
    external_window.onload = () => {
        external_window.document.title = t("External Var Monitor");
        // Move all var monitor sections to external window
        for (let monitor of Object.values(varMonitorData)) {
            monitor.section.deactivate("VARMON:move_to_external");
            monitor.section.activateAt(external_window.document.getElementById("external-center-bar"));
        }

        // hook
        external_window.onbeforeunload = () => {
            for (let monitor of Object.values(varMonitorData)) {
                monitor.section.deactivate("VARMON:move_to_main");
                monitor.section.activateAt(document.getElementById("center-bar"));
            }
        }
    }

    window.onbeforeunload = () => {
        external_window.close();
    }
}

export { VarMonitor, varMonitorData, VarMon_add, VarMon_reset, VarMon_report_ff, VarMon_report_vars, VarMon_report_simend, VarMon_update_frame, VarMon_toggle_external_mode };