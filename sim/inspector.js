import { UI_Section } from "../ui/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from '../ui/controls/controls.js';
// import { FakeVar_FF } from "../phy/ForceField.js";
import { edit_ff } from "./ffeditor.js";
import { hideVisualFieldCover, visualize_ff_FL, visualize_ff_EPS } from "../ui/visual_field.js";

const inspector_ui_section = new UI_Section("Inspector");
inspector_ui_section.activateAt($("#right-bar"));

var last_rendered_phyobj_id = null;
// last_rendered_world_id = null;

function inspect_phyobj(world, phyobj_id) {
    inspector_ui_section.activate();

    if (last_rendered_phyobj_id === phyobj_id) {
        return; // already rendered
    }
    else {
        last_rendered_phyobj_id = phyobj_id;
    }

    var phyobj = world.phyobjs[phyobj_id];
    if (!phyobj) {
        console.error("No phyobj with id:", phyobj_id);
        return;
    }

    // Display the properties of the phyobject in the inspector panel
    inspector_ui_section.clearContent();
    inspector_ui_section.addHTML(`
        <span class='big'> ${phyobj.nickname} </span><br>
        <span class='small gray cursor-pointer' alt="copy" onclick='

            navigator.clipboard.writeText("${phyobj.id}");
            this.querySelector("#symbol1").innerHTML = "&#xE73E;";
            setTimeout(() => { this.querySelector("#symbol1").innerHTML = "&#xE8C8;"; }, 1000);'>

            <b>ID:</b> ${phyobj.id} <span class='symbol' id="symbol1">&#xE8C8;</span>
        </span>
        &emsp;&emsp;
        <span class='small gray'> < ${phyobj.type} > </span>
        <hr>
    `);

    inspector_ui_section
        .addSubsection("Basic Properties", true)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: "Mass",
            variable: phyobj.mass,
            onChange: () => inspector_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: "Position",
            variable: phyobj.pos,
            disabled: true,
            onChange: () => inspector_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: "Velocity",
            variable: phyobj.velocity,
            disabled: true,
            onChange: () => inspector_ui_section.render()
        })

    inspector_ui_section.addSubsection("Vars", false)
        .addUIControl(UIControls.Tables.ColumedList, {
            field: "Variables",
            iterator: phyobj.vars.map(v_id => phyobj.world.vars[v_id]),
            colums: [
                // 第一列：显示变量昵称
                (variable) => {
                    const span = document.createElement("span");
                    span.className = "var-nickname cursor-pointer";

                    // copy functionality
                    span.setAttribute("alt", "copy");
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
                (variable) => UIControls.InputControls.InputMath({
                    field: "",
                    variable: variable,
                    onChange: () => inspector_ui_section.render()
                }),
            ]
        })

    inspector_ui_section.addSubsection("Force Fields", false)
        .addUIControl(UIControls.Tables.ColumedList, {
            field: "Force Fields",
            iterator: phyobj.ffs.map(ff_id => phyobj.world.ffs[ff_id]),
            colums: [
                // 第一列：显示ff昵称
                (ff) => {
                    const span = document.createElement("span");
                    span.className = "var-nickname cursor-pointer";

                    // copy functionality
                    span.setAttribute("alt", "copy");
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
                (ff) => {
                    const buttonArea = document.createElement("div");
                    // Edit button
                    const editButton = document.createElement("span");
                    editButton.className = "small-button symbol";
                    editButton.innerHTML = "&#xE70F;";
                    editButton.onclick = () => edit_ff(phyobj.world, ff.id);
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
                        // hideVisualFieldCover();
                    };
                    buttonArea.appendChild(viewBButton);
                    // Delete button
                    const deleteButton = document.createElement("span");
                    deleteButton.className = "small-button symbol red alert-theme";
                    deleteButton.innerHTML = "&#xE74D;";
                    deleteButton.onclick = () => {
                        // TODO
                    };
                    buttonArea.appendChild(deleteButton);
                    return buttonArea;
                }
            ]
        })

    inspector_ui_section.render();
}


export { inspect_phyobj };