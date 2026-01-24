import { render_frame } from "../sim/render_frame.js";
import { globalSimulation } from "../sim/simulation.js";
import { globalWorld } from "../phy/World.js";
import * as Monitor from "../ui/monitor.js";
import { inspect_phyobj } from "../ui/inspector.js";

function initMode() {
    globalSimulation.restore_backup(0);
    render_frame();
    // switch from monitor -> inspector
    inspect_phyobj(globalWorld, Monitor.last_rendered_phyobj_id || null);
}

function deinitMode() {
    // nothing to clean up for edit mode
    return true;
}

export { initMode, deinitMode };