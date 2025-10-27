import { UI_Section } from "../ui/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from '../ui/controls/controls.js';
import { edit_ff } from "./ffeditor.js";
import { hideVisualFieldCover, visualize_ff_FL, visualize_ff_EPS } from "../ui/visual_field.js";
import { render_frame } from "./render_frame.js";
import { Variable } from '../phy/Var.js';
import { t } from "../i18n/i18n.js";

const inspector_ui_section = new UI_Section(t("Inspector"));
inspector_ui_section.activateAt($("#right-bar"));
inspector_ui_section.deactivate();

var last_rendered_phyobj_id = null;
// last_rendered_world_id = null;

function inspect_phyobj(world, phyobj_id, return_to=null) {
    inspector_ui_section.activate(return_to);

    // Prevent re-constructing
    if (last_rendered_phyobj_id === phyobj_id) {
        inspector_ui_section.render();
        return;
    } else {
        last_rendered_phyobj_id = phyobj_id;
    }

    // Get the phyobject
    var phyobj = world.phyobjs[phyobj_id];
    if (!phyobj) {
        console.error("No phyobj with id:", phyobj_id);
        return;
    }

    // Display the properties of the phyobject in the inspector panel
    inspector_ui_section.clearContent();
    inspector_ui_section.addHTML(`
        <span class='big' id="nickname-display" style="user-select: none;"></span>
        <span class='small gray cursor-pointer' alt="${t("Edit")}" id="edit-nickname">
            <span class='symbol'>&#xE70F;</span>
        </span>

        <br>
        <span class='small gray cursor-pointer' alt="${t("Copy")}" id="copy-id-btn">
            <b>${t("ID")}:</b> ${phyobj.id} <span class='symbol' id="symbol1">&#xE8C8;</span>
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
                this.querySelector("#symbol1").innerHTML = "&#xE8C8;"; 
            }, 1000);
        }

        // nickname edit
        const nicknameDisplay = dom.querySelector("#nickname-display");
        dom.querySelector("#edit-nickname").onclick = () => {
            nicknameDisplay.contentEditable = "true";
            nicknameDisplay.focus();

            nicknameDisplay.onblur = () => {
                nicknameDisplay.contentEditable = "false";
                phyobj.nickname = nicknameDisplay.innerText;
                inspector_ui_section.render();
            }
        }
    });

    var isWorldAnchor = (phyobj.type === "WorldAnchorPO");

    inspector_ui_section
        .addSubsection(t("Basic Properties"), isWorldAnchor)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Mass"),
            variable: phyobj.mass,
            disabled: isWorldAnchor,
            onChange: () => inspector_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Position"),
            variable: phyobj.pos,
            disabled: isWorldAnchor,
            onChange: () => {inspector_ui_section.render(); render_frame(world, phyobj.id);}
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Velocity"),
            variable: phyobj.velocity,
            disabled: true,
            onChange: () => inspector_ui_section.render()
        })

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
                            setTimeout(() => { symbol.innerHTML = "&#xE8C8;"; }, 1000);
                        }
                    };
                    span.innerHTML = `
                        ${variable.nickname} <span class='symbol small gray' id="symbol-var-${variable.id}">&#xE8C8;</span>
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
                            setTimeout(() => { symbol.innerHTML = "&#xE8C8;"; }, 1000);
                        }
                    };
                    span.innerHTML = `
                        ${ff.nickname} <span class='symbol small gray' id="symbol-ff-${ff.id}">&#xE8C8;</span>
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
                    // View-A button
                    const viewAButton = document.createElement("span");
                    viewAButton.className = "small-button symbol";
                    viewAButton.innerHTML = "&#xE890;<sub>◎</sub>";
                    viewAButton.onmouseenter = () => {
                        visualize_ff_EPS(phyobj.world, ff.id);
                    };
                    viewAButton.onmouseleave = () => {
                        hideVisualFieldCover();
                    };
                    buttonArea.appendChild(viewAButton);
                    // View-B button
                    const viewBButton = document.createElement("span");
                    viewBButton.className = "small-button symbol";
                    viewBButton.innerHTML = "&#xE890;<sub>↙</sub>";
                    viewBButton.onmouseenter = () => {
                        visualize_ff_FL(phyobj.world, ff.id);
                    };
                    viewBButton.onmouseleave = () => {
                        hideVisualFieldCover();
                    };
                    buttonArea.appendChild(viewBButton);
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
            ]
        })

    inspector_ui_section.render();
}


export { inspect_phyobj };