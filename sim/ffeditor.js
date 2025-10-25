import { UI_Section } from "../ui/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from '../ui/controls/controls.js';
import { t } from "../i18n/i18n.js";

const ffeditor_ui_section = new UI_Section(t("Force Field Editor"));
ffeditor_ui_section.activateAt($("#right-bar"));
ffeditor_ui_section.deactivate();

var last_rendered_ff_id = null;

function edit_ff(world, ff_id, return_to=null) {
    ffeditor_ui_section.activate(return_to);

    // Prevent re-rendering
    if (last_rendered_ff_id === ff_id) {
        return;
    } else {
        last_rendered_ff_id = ff_id;
    }

    // Get ff
    const ff = world.ffs[ff_id];
    if (!ff) {
        console.error("No force field with id:", ff_id);
        return;
    }

    // Display ff properties
    ffeditor_ui_section.clearContent();
    ffeditor_ui_section.addHTML(`
        <span class='big'>${ff.nickname}</span>
        <br>
        <span class='small gray cursor-pointer' alt="${t("copy")}" onclick='

            navigator.clipboard.writeText("${ff.id}");
            this.querySelector("#symbol1").innerHTML = "&#xE73E;";
            setTimeout(() => { this.querySelector("#symbol1").innerHTML = "&#xE8C8;"; }, 1000);'>

            <b>${t("ID")}:</b> ${ff.id} <span class='symbol' id="symbol1">&#xE8C8;</span>
        </span>
        &emsp;&emsp;
        <span class='small gray'> < ${ff.type} > </span>
        <hr>
    `);

    ffeditor_ui_section
        .addSubsection(t("Applies To"), true)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Strength"),
            variable: ff.strength,
            onChange: () => ffeditor_ui_section.render()
        });

    ffeditor_ui_section.render();
}

export { edit_ff };