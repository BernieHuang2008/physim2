import { UI_Section } from "../ui/ui_section/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from './controls/controls.js';
import { edit_ff } from "./ffeditor.js";
import { hideVisualFieldCover, visualize_ff_FL } from "./visual_field.js";
import { render_frame, setDefaultFocus as rdframe_setDefaultFocus } from "../sim/render_frame.js";
import { Variable } from '../phy/Var.js';
import { ForceField } from "../phy/ForceField.js";
import { t } from "../i18n/i18n.js";
import * as Noti from "./notification/notification.js";
import { assertMode, GlobalModes } from "../mode/global_mode.js";
import { FakeVarFromFunction } from "../phy/FakeVarFromFunction.js";

const inspector_ui_section = new UI_Section(t("Inspector"));
inspector_ui_section.activateAt($("#right-bar"));
inspector_ui_section.deactivate();

var last_rendered_phyobj_id = null;
// last_rendered_world_id = null;

function inspect_phyobj(world, phyobj_id, return_to = null) {
    assertMode([GlobalModes.EDIT, GlobalModes.KEYFRAME])

    inspector_ui_section.activate(return_to);

    // Prevent re-constructing
    if (phyobj_id === null) {
        inspector_ui_section.clearContent();
        inspector_ui_section.render();
        last_rendered_phyobj_id = null;
        return;
    }

    if (last_rendered_phyobj_id === phyobj_id) {
        inspector_ui_section.render();
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

    // focus it
    document.getElementsByClassName("po-focused").item(0)?.classList.remove("po-focused");
    document.getElementById("phyobj-" + phyobj_id).classList.add("po-focused");

    // flags
    var isWorldAnchor = (phyobj.type === "WorldAnchorPO");

    // Display the properties of the phyobject in the inspector panel
    inspector_ui_section.clearContent();

    /* 
    ========================================
        UI Section: Header
    ========================================
    */
    inspector_ui_section
            .addHeadlessSubsection()
            .addHTML(`
                <span class='big' id="nickname-display" style="user-select: none;"></span>
                <span class='small gray cursor-pointer no-select' alt="${t("Edit")}" id="edit-nickname">
                    <span class='symbol'>&#xE70F;</span>
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

            // nickname edit
            const nicknameDisplay = dom.querySelector("#nickname-display");
            dom.querySelector("#edit-nickname").onclick = () => {
                nicknameDisplay.contentEditable = "true";
                nicknameDisplay.focus();

                nicknameDisplay.onblur = () => {
                    nicknameDisplay.contentEditable = "false";
                    phyobj.nickname = nicknameDisplay.innerText.trim();
                    inspector_ui_section.render();
                }
            }
        });

    /*
    ========================================
        UI Section: Basic Properties
    ========================================
    */

    inspector_ui_section
        .addSubsection(t("Basic Properties"), isWorldAnchor)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Mass"),
            variable: phyobj.mass,
            disabled: isWorldAnchor,
            onChange: () => inspector_ui_section.render(),
            help: {
                content: t("HELP_MATHINPUT"),
            }
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Position"),
            variable: phyobj.pos,
            disabled: isWorldAnchor,
            onChange: () => { inspector_ui_section.render(); render_frame(world, phyobj.id); }
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Velocity"),
            variable: phyobj.velocity,
            disabled: isWorldAnchor,
            onChange: () => inspector_ui_section.render()
        })

    /*
    ========================================
        UI Section: Style
    ========================================
    */

    if (!isWorldAnchor) inspector_ui_section
        .addSubsection(t("Style"), isWorldAnchor)
        .addUIControl(UIControls.InputControls.InputColor, {
            field: t("Color"),
            variable: new FakeVarFromFunction(() => phyobj.style.color),
            hide: !Boolean(phyobj.style.color),
            onChange: (newColor) => {
                phyobj.style.color = newColor.value;
                inspector_ui_section.render();
                render_frame(world, phyobj.id);
            }
        })
        .addUIControl(UIControls.InputControls.InputNumber, {
            field: t("Size"),
            variable: phyobj.style.size_var,
            hide: !Boolean(phyobj.style.size_var),
            onChange: (newSize) => {
                inspector_ui_section.render();
                render_frame(world, phyobj.id);
            }
        })

    /* 
    ========================================
        UI Section: Vars & FFs
    ========================================
    */

    inspector_ui_section.addSubsection(t("Vars"), !isWorldAnchor)
        .addUIControl(UIControls.Tables.ColumedList, {
            field: t("Variables"),
            iterator: phyobj.vars,
            colums: [
                // 第一列：显示变量昵称
                (var_id) => {
                    const variable = phyobj.world.vars[var_id];

                    const span = document.createElement("span");
                    span.className = "var-nickname cursor-pointer";

                    // copy functionality
                    span.setAttribute("alt", t("copy"));
                    span.onclick = function () {
                        navigator.clipboard.writeText(variable.id);
                        const symbol = this.querySelector("#symbol-var-" + variable.id);
                        if (symbol) {
                            symbol.innerHTML = "&#xE73E;";
                            setTimeout(() => { symbol.innerHTML = "&#xE16D;"; }, 1000);
                        }
                    };
                    span.innerHTML = `
                        ${variable.nickname} <span class='symbol small gray' id="symbol-var-${variable.id}">&#xE16D;</span>
                        <br>
                        <span class='small gray'>${variable.id}</span>
                    `;

                    return span;
                },
                // 第二列：显示变量的 math input
                (var_id) => UIControls.InputControls.InputMath({
                    field: "",
                    variable: phyobj.world.vars[var_id],
                    onChange: () => inspector_ui_section.render()
                }),
            ],
            onAdd: () => {
                // 添加新var
                var new_var_name = prompt(t("Enter new variable nickname:"), t("new_var"));
                if (new_var_name) {
                    var v = new Variable(new_var_name, "", "derived");
                    phyobj.vars.push(world.add_var(v));
                    inspector_ui_section.render();
                }
            }
        })

    inspector_ui_section.addSubsection(t("Force Fields"), !isWorldAnchor)
        .addUIControl(UIControls.Tables.ColumedList, {
            field: t("Force Fields"),
            iterator: phyobj.ffs,
            colums: [
                // 第一列：显示ff昵称
                (ff_id) => {
                    const ff = phyobj.world.ffs[ff_id];

                    const span = document.createElement("span");
                    span.className = "var-nickname cursor-pointer";

                    // copy functionality
                    span.setAttribute("alt", t("copy"));
                    span.onclick = function () {
                        navigator.clipboard.writeText(ff.id);
                        const symbol = this.querySelector("#symbol-ff-" + ff.id);
                        if (symbol) {
                            symbol.innerHTML = "&#xE73E;";
                            setTimeout(() => { symbol.innerHTML = "&#xE16D;"; }, 1000);
                        }
                    };
                    span.innerHTML = `
                        ${ff.nickname} <span class='symbol small gray' id="symbol-ff-${ff.id}">&#xE16D;</span>
                        <br>
                        <span class='small gray'>${ff.id}</span>
                    `;

                    return span;
                },

                // // 第二列：显示ff的 math input
                // (ff) => UIControls.InputControls.InputMath({ 
                //     field: "", 
                //     variable: new FakeVar_FF(ff), 
                //     onChange: () => inspector_ui_section.render() 
                // }),

                // 第二列：编辑按钮
                (ff_id) => {
                    const ff = phyobj.world.ffs[ff_id];

                    const buttonArea = document.createElement("div");
                    // Edit button
                    const editButton = document.createElement("span");
                    editButton.className = "small-button symbol";
                    editButton.innerHTML = "&#xE70F;";
                    editButton.onclick = () => edit_ff(phyobj.world, ff.id, inspector_ui_section);
                    buttonArea.appendChild(editButton);
                    // View-B button
                    const previewButton = document.createElement("span");
                    previewButton.className = "small-button symbol";
                    previewButton.innerHTML = "&#xE890;<sub>↙</sub>";
                    previewButton.onmouseenter = () => {
                        visualize_ff_FL(phyobj.world, ff.id);
                    };
                    previewButton.onmouseleave = () => {
                        hideVisualFieldCover();
                    };
                    buttonArea.appendChild(previewButton);
                    // Delete button
                    const deleteButton = document.createElement("span");
                    deleteButton.className = "small-button symbol red alert-theme";
                    deleteButton.innerHTML = "&#xE74D;";
                    deleteButton.onclick = () => {
                        if (confirm(t("Are you sure you want to delete this force field?"))) {
                            delete world.ffs[ff_id];
                            phyobj.ffs.pop(phyobj.ffs.indexOf(ff_id));
                            inspector_ui_section.render();
                        }
                    };
                    buttonArea.appendChild(deleteButton);
                    return buttonArea;
                }
            ],
            onAdd: () => {
                // 添加新ff
                var newff = new ForceField(world, "", "");
                phyobj.ffs.push(newff.id);
                inspector_ui_section.render();
                edit_ff(world, newff.id, inspector_ui_section);
            }
        })

    inspector_ui_section.render();
}


export { inspect_phyobj, last_rendered_phyobj_id };