import { $, $$, specialJsonStringifyReplacer, specialJsonStringifyReviver } from "../utils.js";
import { floating_section_expand, floatsec_utils_hide_all } from "./floatsec_utils.js";
import { t } from "../i18n/i18n.js";
import { switchMode, GlobalModes } from "../mode/global_mode.js";
import { pg_about_show } from "./pg_about.js";
import { scheduleRender } from "../sim/render_frame.js";
import * as Noti from "./notification/notification.js";
import { inspect_phyobj } from "./inspector.js";
import { globalWorld, World } from "../phy/World.js";
import * as varmon from "./var_monitor.js";
import filev2 from "../phy/filev2.js";

const menu_dom = document.getElementById("top-bar");
const menu_lv2_dom = document.createElement("div");

function mkMenu(lst) {
    menu_dom.innerHTML = "";
    $("#floating-section").appendChild(menu_lv2_dom);
    menu_lv2_dom.className = "menu-lv2-container no-select hide";

    for (let item of lst) {
        let menu_lv1 = document.createElement("div");
        menu_lv1.className = "menu-lv1";
        // title
        menu_lv1.textContent = item.title;
        // style
        if (item.style) {
            for (let key in item.style) {
                menu_lv1.style[key] = item.style[key];
            }
        }
        // action
        menu_lv1.onclick = function () {
            if (item.action) {
                floatsec_utils_hide_all();
                item.action();
            }
            if (item.items) {
                menu_lv2_dom.classList.remove("hide");
                showMenuLv2(item.items, menu_lv1);
                floating_section_expand();
            }
        };
        menu_dom.appendChild(menu_lv1);
    }
}

function showMenuLv2(lst, menu_lv1_dom) {
    menu_lv2_dom.innerHTML = "";

    menu_lv2_dom.style.left = menu_lv1_dom.getBoundingClientRect().left + "px";
    menu_lv2_dom.style.top = menu_lv1_dom.getBoundingClientRect().bottom + "px";

    for (let item of lst) {
        switch (item.type) {
            case "hr":
                let hr = document.createElement("hr");
                menu_lv2_dom.appendChild(hr);
                break;
            case "submenu":
                let menu_lv2_item = document.createElement("div");
                menu_lv2_item.className = "menu-lv2-item";
                menu_lv2_item.textContent = item.title;
                menu_lv2_dom.appendChild(menu_lv2_item);

                menu_lv2_item.onclick = function () {
                    floatsec_utils_hide_all();
                    item.action();
                }
                break;
        }
    }
}

var curr_proj_name = "Untitled Project.json";

const mainMenu = [
    {
        title: t("About"),
        action: pg_about_show
    },
    {
        title: t("File"),
        items: [
            {
                type: "submenu",
                title: t("Save Project"),
                action: function () {
                    var json = filev2.pack();
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, specialJsonStringifyReplacer));
                    var downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute("download", curr_proj_name);
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                }
            },
            {
                type: "submenu",
                title: t("Open Project"),
                action: function () {
                    var input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = function (event) {
                        var file = event.target.files[0];
                        if (file) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                try {
                                    var json = JSON.parse(e.target.result, specialJsonStringifyReviver);
                                    
                                    switch (json.version) {
                                        case undefined:
                                            // Noti.warning(t("Old file format detected, trying to load with legacy loader..."));
                                            globalWorld.reset(World.fromJSON(json));
                                            scheduleRender(globalWorld, globalWorld.anchor, false, () => inspect_phyobj(globalWorld, globalWorld.anchor));
                                            break;
                                        case "file-v2":
                                            filev2.load(json);
                                            break;
                                        default:
                                            Noti.error(t("Unsupported file version: " + json.version));
                                    }

                                    curr_proj_name = file.name;
                                    console.log("Loaded world:", curr_proj_name, globalWorld);
                                } catch (error) {
                                    Noti.error(t("Failed to load world"), error.message);
                                    console.error('Error loading world:', error);
                                }
                            };
                            reader.readAsText(file);
                        }
                    };
                    input.click();
                }
            },
            {
                type: "submenu",
                title: t("New Project"),
                action: function () {
                    globalWorld.reset(new World());
                    scheduleRender(globalWorld, globalWorld.anchor, false, () => inspect_phyobj(globalWorld, globalWorld.anchor));
                    varmon.VarMon_reset();
                    curr_proj_name = "Untitled Project.json";
                }
            }
        ]
    },
    {
        title: t("Mode"),
        items: [
            {
                type: "submenu",
                title: t("Edit Mode"),
                action: function () {
                    switchMode(GlobalModes.EDIT);
                }
            },
            {
                type: "submenu",
                title: t("Simulation Mode"),
                action: function () {
                    switchMode(GlobalModes.SIMULATE);
                }
            },
            {
                type: "submenu",
                title: t("Keyframe Mode"),
                action: function () {
                    switchMode(GlobalModes.KEYFRAME);
                }
            }
        ]
    }
];

function showContextMenu(lst, anchorDom) {
    menu_lv2_dom.classList.remove("hide");
    showMenuLv2(lst, anchorDom);
    floating_section_expand();
}

export { mkMenu, mainMenu, showContextMenu };