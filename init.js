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
import { globalWorld, World } from "./phy/World.js";
import { render_frame } from "./sim/render_frame.js";
import { globalSimulation } from "./sim/simulation.js";
import { AnimationController, stepAnimation, simulateToTime, resetSimulation } from "./sim/animation.js";

// Global animation controller for menu access
window.menuAnimationController = null;

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
                    var json = globalWorld.toJSON();
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
                                    globalWorld.reset(newWorld);
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
    },
    {
        title: t("Simulate"),
        items: [
            {
                type: "submenu",
                title: t("Start Animation (60 FPS)"),
                action: function() {
                    try {
                        // Stop existing animation if running
                        if (window.menuAnimationController && window.menuAnimationController.isRunning) {
                            window.menuAnimationController.stop();
                        }
                        
                        // Create new animation controller
                        window.menuAnimationController = new AnimationController(globalSimulation);
                        window.menuAnimationController.start(60);
                        
                        Noti.info(t("Animation Started"), t("Animation started at 60 FPS"));
                        console.log("Started simulation animation at 60 FPS");
                    } catch (error) {
                        Noti.error(t("Animation Error"), error.message);
                        console.error('Error starting animation:', error);
                    }
                }
            },
            {
                type: "submenu",
                title: t("Stop Animation"),
                action: function() {
                    try {
                        if (window.menuAnimationController) {
                            window.menuAnimationController.stop();
                            Noti.info(t("Animation Stopped"), t("Animation has been stopped"));
                            console.log("Animation stopped");
                        } else {
                            Noti.warning(t("No Animation"), t("No animation is currently running"));
                        }
                    } catch (error) {
                        Noti.error(t("Animation Error"), error.message);
                        console.error('Error stopping animation:', error);
                    }
                }
            },
            {
                type: "hr"
            },
            {
                type: "submenu",
                title: t("Step Animation (1 step)"),
                action: function() {
                    try {
                        stepAnimation(globalSimulation, 1);
                        Noti.info(t("Step Complete"), t("Stepped 1 physics frame"));
                        console.log(`Stepped 1 physics step. Simulation time: ${globalSimulation.time.toFixed(4)}s`);
                    } catch (error) {
                        Noti.error(t("Step Error"), error.message);
                        console.error('Error stepping animation:', error);
                    }
                }
            },
            {
                type: "submenu",
                title: t("Step Animation (10 steps)"),
                action: function() {
                    try {
                        stepAnimation(globalSimulation, 10);
                        Noti.info(t("Step Complete"), t("Stepped 10 physics frames"));
                        console.log(`Stepped 10 physics steps. Simulation time: ${globalSimulation.time.toFixed(4)}s`);
                    } catch (error) {
                        Noti.error(t("Step Error"), error.message);
                        console.error('Error stepping animation:', error);
                    }
                }
            },
            {
                type: "hr"
            },
            {
                type: "submenu",
                title: t("Reset Simulation"),
                action: function() {
                    try {
                        // Stop animation if running
                        if (window.menuAnimationController && window.menuAnimationController.isRunning) {
                            window.menuAnimationController.stop();
                        }
                        
                        resetSimulation(globalSimulation);
                        Noti.info(t("Simulation Reset"), t("Simulation reset to time 0"));
                        console.log("Simulation reset to time 0");
                    } catch (error) {
                        Noti.error(t("Reset Error"), error.message);
                        console.error('Error resetting simulation:', error);
                    }
                }
            }
        ]
    }
]);
