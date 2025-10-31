import { UI_Section } from "../ui/ui_section/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from './controls/controls.js';
import { edit_ff } from "./ffeditor.js";
import { hideVisualFieldCover, visualize_ff_FL, visualize_ff_EPS } from "./visual_field.js";
import { render_frame, setDefaultFocus as rdframe_setDefaultFocus } from "../sim/render_frame.js";
import { Variable } from '../phy/Var.js';
import { ForceField } from "../phy/ForceField.js";
import { t } from "../i18n/i18n.js";
import * as Noti from "./notification/notification.js";
import {assertMode, GlobalModes} from "../mode/global_mode.js";

const monitor_ui_section = new UI_Section(t("Monitor"));
monitor_ui_section.activateAt($("#right-bar"));
monitor_ui_section.deactivate();

var last_rendered_phyobj_id = null;
// last_rendered_world_id = null;

function monitor_phyobj(world, phyobj_id, return_to=null) {
    assertMode([GlobalModes.SIMULATE])

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

    // Display the properties of the phyobject in the inspector panel
    monitor_ui_section.clearContent();
    monitor_ui_section.addHTML(`
        <span class='big' id="nickname-display" style="user-select: none;"></span>

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
    });

    var isWorldAnchor = (phyobj.type === "WorldAnchorPO");

    monitor_ui_section
        .addSubsection(t("Basic Properties"), isWorldAnchor)
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Mass"),
            variable: phyobj.mass,
            disabled: true,
            onChange: () => monitor_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Position"),
            variable: phyobj.pos,
            disabled: true,
            onChange: () => {monitor_ui_section.render(); render_frame(world, phyobj.id);}
        })
        .addUIControl(UIControls.InputControls.InputVector2, {
            field: t("Velocity"),
            variable: phyobj.velocity,
            disabled: true,
            onChange: () => monitor_ui_section.render()
        })

    monitor_ui_section
        .addSubsection(t("Force Analysis"))
        .addUIControl(UIControls.Display.displayVector2Multi, {
            field: t("All Component Forces"),
            getVectors: () => {
                function _createV(v, n) {
                    return {
                        nickname: n,
                        value: v
                    }
                }
                
                return [
                    _createV([1,2], "E"),
                    _createV([3, 5], "Gravity")
                ]
            }
        })

    monitor_ui_section.render();
}


export { monitor_phyobj };