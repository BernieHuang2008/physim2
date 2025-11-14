import { render_frame } from "../sim/render_frame.js";
import { globalSimulation } from "../sim/simulation.js";

function initMode() {
    globalSimulation.restore_backup(0);
    render_frame();
}

function deinitMode() {
    // nothing to clean up for edit mode
    return true;
}

export { initMode, deinitMode };