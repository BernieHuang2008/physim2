import { UI_Section } from "../ui/ui_section/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from './controls/controls.js';
import { render_frame, setDefaultFocus as rdframe_setDefaultFocus } from "../sim/render_frame.js";
import { t } from "../i18n/i18n.js";
import * as Noti from "./notification/notification.js";
import { assertMode, GlobalModes } from "../mode/global_mode.js";
import { globalSimulation, SETTINGS } from "../sim/simulation.js";
import { FakeVarFromFunction } from "../phy/FakeVarFromFunction.js";
import { livemon_add } from "./live_monitor.js";

const monitor_ui_section = new UI_Section(t("Monitor"));
monitor_ui_section.activateAt($("#right-bar"));
monitor_ui_section.deactivate();

var last_rendered_phyobj_id = null;
// last_rendered_world_id = null;

// "Monit Var" Controls
function mvc(var_id, vec_comp = null) {
    if (typeof vec_comp === "number") {
        var_id += `[${vec_comp}]`;
    } else if (vec_comp === "mag") {
        var_id = `norm(${var_id})`;
    }

    return `
        <span class="small gray cursor-pointer no-select" alt="${t('Monit')}" onclick="window.mvc_helper(this)" data-livemon-id="${var_id}">
            <span class="symbol">&#xE9F9;</span>
        </span>
        `;
}
window.mvc_helper = function (elem) {
    const id = elem.getAttribute("data-livemon-id");
    livemon_add(id, id, id);

    Noti.info(t("Live Monitor"), t("Added to Live Monitor"));
}

function monitor_phyobj(world, phyobj_id, return_to = null) {
    assertMode([GlobalModes.SIMULATE])
    rdframe_setDefaultFocus(null);

    monitor_ui_section.activate(return_to);

    // Prevent re-constructing
    if (last_rendered_phyobj_id === phyobj_id) {
        monitor_ui_section.render();
        return;
    } else {
        last_rendered_phyobj_id = phyobj_id;
    }

    // Get the phyobject
    var phyobj = world.phyobjs[phyobj_id];
    if (!phyobj) {
        Noti.error(t("Physics Object Not Found"), `No physics object found with ID: ${phyobj_id}`);
        console.error("No phyobj with id:", phyobj_id);
        return;
    }

    var focusOn = false;
    // Display the properties of the phyobject in the inspector panel
    monitor_ui_section.clearContent();
    monitor_ui_section
        .addHeadlessSubsection()
        .addHTML(`
                <span class='big' id="nickname-display" style="user-select: none;"></span>
                <span class='small gray cursor-pointer no-select' alt="${t("Focus")}" id="focus-po">
                    <span class='symbol'>&#xE78F;</span>
                </span>

                <br>
                <span class='small gray cursor-pointer' alt="${t("Copy")}" id="copy-id-btn">
                    <b>${t("ID")}:</b> ${phyobj.id} <span class='symbol' id="symbol1">&#xE16D;</span>
                </span>
                &emsp;&emsp;
                <span class='small gray'> < ${phyobj.type} > </span>
                <hr>
            `, (dom) => {
            // nickname display
            dom.querySelector("#nickname-display").innerText = phyobj.nickname;

            // id copy
            dom.querySelector("#copy-id-btn").onclick = function () {
                navigator.clipboard.writeText(phyobj.id);
                this.querySelector("#symbol1").innerHTML = "&#xE73E;";
                setTimeout(() => {
                    this.querySelector("#symbol1").innerHTML = "&#xE16D;";
                }, 1000);
            }

            // po focus
            const focusPoBtn = dom.querySelector("#focus-po");
            focusPoBtn.onclick = () => {
                focusPoBtn.classList.toggle("on");
                if (focusPoBtn.classList.contains("on")) {
                    rdframe_setDefaultFocus(phyobj.id);
                    focusOn = true;
                } else {
                    rdframe_setDefaultFocus(null);
                    focusOn = false;
                }
            }
            if (focusOn) {
                focusPoBtn.classList.add("on");
            } else {
                focusPoBtn.classList.remove("on");
            }
        });

    var isWorldAnchor = (phyobj.type === "WorldAnchorPO");

    monitor_ui_section
        .addSubsection(t("Basic Properties"), isWorldAnchor)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Mass") + mvc(phyobj.mass.id),
            variable: phyobj.mass,
            disabled: true,
            onChange: () => monitor_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Position") + mvc(phyobj.pos.id, "mag"),
            variable: phyobj.pos,
            disabled: true,
            onChange: () => { monitor_ui_section.render(); render_frame(world, phyobj.id); }
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Velocity") + mvc(phyobj.velocity.id, "mag"),
            variable: phyobj.velocity,
            disabled: true,
            onChange: () => monitor_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Acceleration"),
            variable: new FakeVarFromFunction(() => {
                // Calculate total force first
                let totalForce = [0, 0];

                // Sum forces from all force fields
                var vars = {
                    dt: SETTINGS.dt,
                };
                for (let var_id in world.vars) {
                    vars[var_id] = world.vars[var_id].calc(world.vars, globalSimulation.time);
                }

                var ffd_id = null;
                for (let ffid in world.ffs) {
                    let ff = world.ffs[ffid];
                    if (!ff.judge_condition(phyobj, globalSimulation.time, vars)) continue;

                    if (ff.type === "FFD") {
                        if (ffd_id !== null) {
                            Noti.error(t("Simulation Error: Overlapping FFDs"), t("Detected multiple FFDs on one object!"));
                            throw new Error("Multiple FFDs detected in acceleration calculation!");
                        }
                        ffd_id = ffid;
                    } else {
                        let force = ff.compute_force(phyobj, globalSimulation.time, vars);
                        if (force && Array.isArray(force) && force.length >= 2) {
                            totalForce[0] += force[0] || 0;
                            totalForce[1] += force[1] || 0;
                        }
                    }
                }

                // post-process FFD
                if (ffd_id !== null) {
                    let ffd_force = world.ffs[ffd_id].compute_force_ffd(phyobj, globalSimulation.time, vars, totalForce);
                    if (ffd_force) {
                        totalForce[0] += ffd_force[0] || 0;
                        totalForce[1] += ffd_force[1] || 0;
                    }
                }

                // Calculate acceleration: F = ma, so a = F/m
                const mass = phyobj.mass.value;
                return mass > 0 ? [totalForce[0] / mass, totalForce[1] / mass] : [0, 0];
            }),
            disabled: true,
            onChange: () => monitor_ui_section.render()
        })

    monitor_ui_section
        .addSubsection(t("Force Analysis"), false)
        .addUIControl(UIControls.Dynamic(() => {
            const div = document.createElement('div');
            div.innerHTML = `
                <b>${t("Current Time")}:</b> 
                <span style="font-family: monospace; color: #666;">
                    t = ${globalSimulation.time.toFixed(4)} s
                </span>
            `;
            div.style.marginBottom = "10px";
            div.style.fontSize = "0.9em";
            return div;
        }))
        .addUIControl(UIControls.Display.displayVector2Multi, {
            field: t("All Component Forces"),
            getVectors: () => {
                function _createV(v, n) {
                    return {
                        nickname: n,
                        value: v
                    }
                }

                let forces = [];
                let totalForce = [0, 0];

                var vars = {
                    dt: SETTINGS.dt,
                };
                for (let var_id in world.vars) {
                    vars[var_id] = world.vars[var_id].calc(world.vars, globalSimulation.time);
                }

                // Calculate forces from each force field
                var ffd_id = null;
                for (let ffid in world.ffs) {
                    let ff = world.ffs[ffid];
                    if (!ff.judge_condition(phyobj, globalSimulation.time, vars)) continue;

                    if (ff.type === "FFD") {
                        if (ffd_id !== null) {
                            Noti.error(t("Simulation Error: Overlapping FFDs"), t("Detected multiple FFDs on one object!"));
                            throw new Error("Multiple FFDs detected in acceleration calculation!");
                        }
                        ffd_id = ffid;
                    } else {

                        try {
                            let force = ff.compute_force(phyobj, globalSimulation.time, vars);
                            if (force && Array.isArray(force) && force.length >= 2) {
                                forces.push(_createV([force[0] || 0, force[1] || 0], ff.nickname));
                                totalForce[0] += force[0] || 0;
                                totalForce[1] += force[1] || 0;
                                // forces.push(force);
                            }
                        } catch (error) {
                            console.warn(`Error calculating force from ${ff.nickname}:`, error);
                            forces.push(_createV([0, 0], ff.nickname + " (Error)"));
                        }
                    }
                }

                // post-process FFD
                if (ffd_id !== null) {
                    let ffd_force = world.ffs[ffd_id].compute_force_ffd(phyobj, globalSimulation.time, vars, totalForce);
                    if (ffd_force) {
                        forces.push(_createV([ffd_force[0] || 0, ffd_force[1] || 0], world.ffs[ffd_id].nickname + ` [${t("FFD")}]`));
                    }
                }

                return forces;
            }
        });

    monitor_ui_section.render();
}


export { monitor_phyobj, monitor_ui_section, last_rendered_phyobj_id };