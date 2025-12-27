import { t } from "./i18n/i18n.js";
import { $, $$ } from "./utils.js";

/* ---- Global mode ---- */
import { render_frame } from "./sim/render_frame.js";
import { switchMode, GlobalModes } from "./mode/global_mode.js";
switchMode(GlobalModes.EDIT);
document.getElementById("mode-badge").onclick = () => render_frame();

/* ---- Floating Section ---- */
import { floating_section_init } from "./ui/floatsec_utils.js";
floating_section_init();

/* ---- About Page ---- */
import { init_pg_about } from "./ui/pg_about.js";
init_pg_about();

/* ---- Notification ---- */
import * as Noti from "./ui/notification/notification.js";
Noti.init();

/* ---- Epsilon Control ---- */
import { epsilon_init } from "./ui/epsilon_ctl/epsilon_ctl.js";
epsilon_init();

/* ---- Animation Speed Control ---- */
import { aspd_init } from "./ui/anispeed_ctl/anispeed.js";
aspd_init();

/* ---- Zoom Control ---- */
import { ZoomControl } from "./ui/zoom_ctl/zoom_ctl.js";
const zoomControl = new ZoomControl();
const zoomContainer = document.getElementById('zoom-control-container');
if (zoomContainer) {
    zoomContainer.appendChild(zoomControl.getElement());
}

/* ---- Layer Select Cleanup on Click ---- */
import { end_LSsession, preventDocScrollDuringLS } from "./ui/layer_select.js";
$("#center-zone").addEventListener('wheel', preventDocScrollDuringLS);
document.addEventListener('click', end_LSsession);
document.addEventListener('mousemove', end_LSsession);

/* ---- Top Menu ---- */
import { mkMenu, mainMenu } from "./ui/menu.js";
mkMenu(mainMenu);

/* ---- Left Bar ---- */
import { createLeftBar } from "./ui/leftbar.js";
createLeftBar();

