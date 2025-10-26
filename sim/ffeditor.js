import { UI_Section } from "../ui/ui_section.js";
import { $, $$ } from '../utils.js';
import { UIControls } from '../ui/controls/controls.js';
import { FakeVar_FFExpression, FakeVar_FFCondition } from "../phy/ForceField.js";
import { Variable } from "../phy/Var.js";
import { visualize_ff_FL, visualize_ff_EPS, showVisualFieldCover, hideVisualFieldCover } from "../ui/visual_field.js";
import { t } from "../i18n/i18n.js";

const ffeditor_ui_section = new UI_Section(t("Force Field Editor"));
ffeditor_ui_section.activateAt($("#right-bar"));
ffeditor_ui_section.deactivate();

// var last_rendered_ff_id = null;

const templateUpdaters = {
    gravity: (ff) => {
        var params = ff.template.params;
        var condition = "true";
        var expression = `mass * ${params.g} * ${params.direction} / norm(${params.direction})`;

        ff.reset(condition, expression);
    },
    universal_gravitational: (ff) => {
        var params = ff.template.params;
        var condition = "true";
        var expression = `${params.G} * mass * ${ff.master_phyobj.mass.id} / (norm(pos - ${ff.master_phyobj.pos.id}) ^ 2) * ((pos - ${ff.master_phyobj.pos.id}) / norm(pos - ${ff.master_phyobj.pos.id}))`;

        ff.reset(condition, expression);
    },
    electrostatic: (ff) => {
        var params = ff.template.params;

    }
}

function defaultTemplates(template_type) {
    return (ff) => {
        // prev-do: clear previous params from master phyobj
        ff.clear_template_params();

        // params
        var params = {};
        switch (template_type) {
            case "gravity":
                params = {
                    g: new Variable('g', 9.81, 'immediate'),
                    direction: new Variable('direction', [0, -1], 'immediate')
                };
                break;
            case "universal_gravitational":
                params = {
                    G: new Variable('G', 6.67430e-11, 'immediate')
                };
                break;
            case "electrostatic":
                params = {
                    k: new Variable('k', 8.9875517923e9, 'immediate')
                };
                break;
        }

        // params: Var -> id
        var params_id = {};
        for (let pname in params) {
            let id = ff.world.add(params[pname]);
            params_id[pname] = id;
            ff.master_phyobj.vars.push(id);
        }

        return {
            type: template_type,
            params: params_id,
        };
    }
}

function edit_ff(world, ff_id, return_to=null) {
    ffeditor_ui_section.activate(return_to);

    // Prevent re-constructing
    // if (last_rendered_ff_id === ff_id) {
    //     ffeditor_ui_section.render();
    //     return;
    // } else {
    //     last_rendered_ff_id = ff_id;
    // }

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
        .addSubsection(t("Preview & Operation"), false)
        .addUIControl(() => {
            const buttonArea = document.createElement("div");
            // View-A button
            const viewAButton = document.createElement("span");
            viewAButton.className = "small-button symbol";
            viewAButton.innerHTML = "&#xE890;<sub>◎</sub>";
            viewAButton.onmouseenter = () => {
                visualize_ff_EPS(ff.world, ff.id);
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
                visualize_ff_FL(ff.world, ff.id);
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
                // TODO
            };
            buttonArea.appendChild(deleteButton);
            return buttonArea;
        });

    ffeditor_ui_section
        .addSubsection(t("Choose Template"), !(ff.template.type !== "custom"))
        .addUIControl(UIControls.Radio.RadioWithImage, {
            options: [
                {
                    label: t("Gravity"),
                    value: "gravity",
                    image: "assets/images/gravity_bw.svg",
                    imgSelected: "assets/images/gravity_c.svg",
                },
                {
                    label: t("Universal Gravitational"),
                    value: "universal_gravitational",
                    image: "assets/images/unigravity_bw.svg",
                    imgSelected: "assets/images/unigravity_c.svg",
                },
                {
                    label: t("Electrostatic"),
                    value: "electrostatic",
                    image: "assets/images/elec_bw.svg",
                    imgSelected: "assets/images/elec_c.svg",
                }
            ],
            getCurrentValue: () => ff.template.type,
            onChange: (oldValue, newValue) => {
                if (confirm(t("Use New Template? By doing this, current settings will be LOST."))) {
                    // ff.setTemplate(newValue);
                    ff.template.type = newValue;
                    ff.template = defaultTemplates(newValue)(ff);
                    templateUpdaters[newValue](ff);
                } else {
                    ff.template.type = oldValue;
                }
                ffeditor_ui_section.render();
            }
        })

    ffeditor_ui_section
        .addSubsection(t("Template Settings"), !(ff.template.type !== "custom"))
        .addUIControl(UIControls.Dynamic(() => {
            switch (ff.template.type) {
                case "gravity":
                    return [
                        UIControls.InputControls.InputMath({
                            field: t("Gravitational Acceleration (g)"),
                            variable: world.vars[ff.template.params.g],
                            onChange: () => ffeditor_ui_section.render()
                        }),
                        UIControls.InputControls.InputVector2({
                            field: t("Direction"),
                            variable: world.vars[ff.template.params.direction],
                            onChange: () => ffeditor_ui_section.render()
                        })
                    ];
                case "universal_gravitational":
                    return [
                        UIControls.InputControls.InputMath({
                            field: t("Gravitational Constant (G)"),
                            variable: world.vars[ff.template.params.G],
                            onChange: () => ffeditor_ui_section.render()
                        })
                    ];
                case "electrostatic":
                    return [
                        UIControls.InputControls.InputMath({
                            field: t("Coulomb's Constant (k)"),
                            variable: world.vars[ff.template.params.k],
                            onChange: () => ffeditor_ui_section.render()
                        })
                    ];
            }
        }))

    ffeditor_ui_section
        .addSubsection(t("Advanced Settings"), !(ff.template.type === "custom"))
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Application Scope"),
            variable: new FakeVar_FFCondition(ff),
            onChange: () => ffeditor_ui_section.render()
        })
        .addUIControl(UIControls.InputControls.InputMath, {
            field: t("Expression"),
            variable: new FakeVar_FFExpression(ff),
            onChange: () => ffeditor_ui_section.render()
        });

    ffeditor_ui_section.render();
}

export { edit_ff };