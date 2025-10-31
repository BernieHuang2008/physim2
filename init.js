import { t } from "./i18n/i18n.js";
/* ---- Floating Section ---- */
import { floating_section_init } from "./ui/floatsec_utils.js";
floating_section_init();

/* ---- Notification ---- */
import * as Noti from "./ui/notification/notification.js";
Noti.init();

/* ---- Epsilon Control ---- */
import { epsilon_init } from "./ui/epsilon_ctl/epsilon_ctl.js";
epsilon_init();

/* ---- Top Menu ---- */
import { mkMenu } from "./ui/menu.js";
import { World } from "./phy/world.js";
import { render_frame } from "./sim/render_frame.js";
mkMenu([
    {
        title: t("File"),
        items: [
            {
                type: "hr"
            },
            {
                type: "submenu",
                title: t("Save World (static)"),
                action: function() {
                    var json = window.world.toJSON();
                    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
                    var downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute("download", "physim_world_static.json");
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                }
            },
            {
                type: "submenu",
                title: t("Load World (static)"),
                action: function() {
                    var input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = function(event) {
                        var file = event.target.files[0];
                        if (file) {
                            var reader = new FileReader();
                            reader.onload = function(e) {
                                try {
                                    var json = JSON.parse(e.target.result);
                                    var newWorld = World.fromJSON(json);
                                    window.world.reset(newWorld);
                                    console.log("Loaded world:", newWorld);
                                    render_frame(newWorld);
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
        ]
    }
]);
