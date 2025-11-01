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

/* ---- FPS Control ---- */
import { fps_init } from "./ui/fps_ctl/fps_ctl.js";
fps_init();

/* ---- Zoom Control ---- */
import { ZoomControl } from "./ui/zoom_ctl/zoom_ctl.js";
const zoomControl = new ZoomControl();
const zoomContainer = document.getElementById('zoom-control-container');
if (zoomContainer) {
    zoomContainer.appendChild(zoomControl.getElement());
}

/* ---- Top Menu ---- */
import { mkMenu, mainMenu } from "./ui/menu.js";
mkMenu(mainMenu);
