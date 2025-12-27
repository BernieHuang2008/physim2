// select object if they are in ONE pos
import { globalWorld } from '../phy/World.js';
import { render_frame } from '../sim/render_frame.js';
import { inspect_phyobj } from './inspector.js';

var LSsession = {
    active: false,
    mousePos: [0, 0],
    overlayed_phyobjs: [],
    currLayer: 0
}

function _get_overlayed_phyobjs(world, screenX, screenY) {
    // TODO: use a better algorithm
    const simArea = document.getElementById("simulation-area-anchor");
    var overlayed_phyobjs = [];

    for (let po of Object.values(world.phyobjs)) {
        let po_dom = document.getElementById("phyobj-" + po.id);
        let rect = po_dom.getBoundingClientRect();

        if (rect.left <= screenX && rect.right >= screenX &&
            rect.top <= screenY && rect.bottom >= screenY) {
            // inside
            overlayed_phyobjs.push(po);
        }
    }

    return overlayed_phyobjs;
}

function end_LSsession() {
    if (!LSsession.active) {
        return;
    }

    // remove UI effects
    var doms = LSsession.overlayed_phyobjs.map(po => document.getElementById("phyobj-" + po.id));
    for (let i = 0; i < doms.length; i++) {
        doms[i].classList.remove("in_ls");
        doms[i].style.translate = `-50% -50%`;
    }

    // reset session
    LSsession.active = false;
    LSsession.mousePos = [0, 0];
    LSsession.overlayed_phyobjs = [];
    LSsession.currLayer = 0;
}

function render_ls_ui(overlayed_phyobjs, currLayer) {
    var doms = overlayed_phyobjs.map(po => document.getElementById("phyobj-" + po.id));

    for (let i = 0; i < doms.length; i++) {
        doms[i].classList.add("in_ls");
        doms[i].style.translate = `calc(-50% + ${(i-LSsession.currLayer)*10}px) calc(-50% + ${(i-LSsession.currLayer)*10}px)`;
    }
}

function display_layer_select(e) {
    e.preventDefault();

    const deltaY = e.deltaY > 0 ? 1 : -1;

    if (LSsession.active) {
        // continue existing session
        var new_index = (LSsession.currLayer + deltaY + LSsession.overlayed_phyobjs.length) % LSsession.overlayed_phyobjs.length;
        var new_po = LSsession.overlayed_phyobjs[new_index];
        inspect_phyobj(globalWorld, new_po.id);
        LSsession.currLayer = new_index;

        render_ls_ui(LSsession.overlayed_phyobjs, LSsession.currLayer);
    }
    else {
        // start new session
        var overlayed_phyobjs = _get_overlayed_phyobjs(globalWorld, e.clientX, e.clientY);
        if (overlayed_phyobjs.length <= 1) {
            return; // no need to display layer select
        }

        var current_index = overlayed_phyobjs.findIndex(po => po.id === e.target.dataset.phyobjid);
        console.log("Overlayed phyobjs:", overlayed_phyobjs, "Current index:", current_index);

        var new_index = (current_index + deltaY + overlayed_phyobjs.length) % overlayed_phyobjs.length;
        var new_po = overlayed_phyobjs[new_index];
        inspect_phyobj(globalWorld, new_po.id);

        LSsession.active = true;
        LSsession.mousePos = [e.clientX, e.clientY];
        LSsession.overlayed_phyobjs = overlayed_phyobjs;
        LSsession.currLayer = new_index;

        render_ls_ui(LSsession.overlayed_phyobjs, LSsession.currLayer);
    }
}

function preventDocScrollDuringLS(e) {
    if (LSsession.active) {
        // console.log("Preventing document scroll during LS session.");
        e.preventDefault();
        return false;
    }
}

export { display_layer_select, end_LSsession, preventDocScrollDuringLS };