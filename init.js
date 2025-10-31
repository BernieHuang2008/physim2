import { t } from "./i18n/i18n.js";

/* ---- Global mode ---- */
import { switchMode, GlobalModes } from "./mode/global_mode.js";
switchMode(GlobalModes.EDIT);

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
import { mkMenu, mainMenu } from "./ui/menu.js";
import { globalWorld, World } from "./phy/World.js";
import { render_frame } from "./sim/render_frame.js";
import { globalSimulation } from "./sim/simulation.js";

// Global animation controller for menu access
window.menuAnimationController = null;

mkMenu(mainMenu);
