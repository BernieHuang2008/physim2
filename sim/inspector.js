import { UI_Section } from "../ui/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from '../ui/controls/controls.js';

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
        .addSubsection("Basic Properties", false)
        .addUIControl(UIControls.InputControls.InputMath, { field: "Mass", variable: phyobj.mass })
        .addUIControl(UIControls.InputControls.InputVector2, { field: "Position", variable: phyobj.pos, disabled: true })
        .addUIControl(UIControls.InputControls.InputVector2, { field: "Velocity", variable: phyobj.velocity, disabled: true })

    inspector_ui_section.addSubsection("Vars")
        .addUIControl(UIControls.Tables.ColumedList, { 
            field: "Variables", 
            iterator: phyobj.vars.map(v_id => phyobj.world.vars[v_id]),
            colums: [
                // 第一列：显示变量昵称
                (variable) => {
                    const span = document.createElement("span");
                    span.className = "var-nickname";
                    span.textContent = variable.nickname;
                    return span;
                },
                // 第二列：显示变量的 math input
                (variable) => UIControls.InputControls.InputMath({ field: "", variable: variable }),
            ]
        })

    inspector_ui_section.render();
}


export { inspect_phyobj };