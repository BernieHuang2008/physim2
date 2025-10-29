import { $, $$ } from '../utils.js';
import { PhyObjOnClickEvent } from './events.js';
import { inspect_phyobj } from '../ui/inspector.js';

var render_area = [0, 0, 0, 0]; // xmin, xmax, ymin, ymax

var zoom_level = 10.0;

function setZoomLevel(level) {
    zoom_level = Math.max(0.1, Math.min(10.0, level)); // clamp between 0.1x and 10x
}

function getZoomLevel() {
    return zoom_level;
}

function revY(y) {
    // convert from cartesian y to screen y
    // not a typo. this function is just a marker for readability
    return y;
}

function render_frame(world, focus_id = null) {
    var content_area = render_phyobjs(world);
    render_displayArea(content_area, world);

    // focus: scroll into view
    if (focus_id) {
        const element = $("#phyobj-" + focus_id);
        element.scrollIntoView({
            behavior: 'smooth',
        });
    }
}

function render_phyobj(phyobj) {
    // render a single phyobject
    const sim_anchor = document.getElementById("simulation-area-anchor");

    var dom_id = "phyobj-" + phyobj.id;
    var dom_element = $("#" + dom_id);
    if (!dom_element) {
        dom_element = document.createElement("div");
        // basic setup
        dom_element.id = dom_id;
        dom_element.className = "phyobj";
        dom_element.dataset.phyobjid = phyobj.id;

        // bind events
        dom_element.onclick = PhyObjOnClickEvent(phyobj.world, phyobj.id);

        sim_anchor.appendChild(dom_element);
    }

    switch (phyobj.type) {
        case 'ParticlePO':
            {
                dom_element.classList.add("phyobj-particle");
                dom_element.style.left = (phyobj.pos.value[0] * zoom_level) + "px";
                dom_element.style.top = revY(-phyobj.pos.value[1] * zoom_level) + "px";
            }
    }

    return phyobj.pos.value;
}

function render_phyobjs(world) {
    var unupdated_elements = new Set(Array.from($$(".phyobj")).map(el => el.dataset.phyobjid));
    var content_area = [0, 0, 0, 0]; // xmin, xmax, ymin, ymax

    // render all phyobjects in the world
    for (let id in world.phyobjs) {
        let phyobj = world.phyobjs[id];
        unupdated_elements.delete(phyobj.id);
        var pos = render_phyobj(phyobj);

        // update content area
        content_area[0] = Math.min(content_area[0], pos[0] * zoom_level);
        content_area[1] = Math.max(content_area[1], pos[0] * zoom_level);
        content_area[2] = Math.min(content_area[2], pos[1] * zoom_level);
        content_area[3] = Math.max(content_area[3], pos[1] * zoom_level);
    }

    // remove unneeded elements
    unupdated_elements.forEach(id => {
        let el = $("#phyobj-" + id);
        if (el) {
            el.remove();
        }
    });

    return content_area;
}

function render_displayArea(content_area, world) {
    const GRID_SIZE = 20;
    const MARGIN = 100;

    var min_content_area = [-window.innerWidth / 2, window.innerWidth / 2, -window.innerHeight / 2, window.innerHeight / 2];
    render_area = [
        Math.min(content_area[0], min_content_area[0]) - MARGIN,
        Math.max(content_area[1], min_content_area[1]) + MARGIN,
        Math.min(content_area[2], min_content_area[2]) - MARGIN,
        Math.max(content_area[3], min_content_area[3]) + MARGIN,
    ];

    /* Setup simulation area */
    const sim_anchor = document.getElementById("simulation-area-anchor");
    const sim_bg = document.getElementById("simulation-area-background");
    sim_bg.onclick = (e) => {
        // click on background: open 'World Anchor'
        inspect_phyobj(world, world.anchor);
    }

    // set background size
    const area_width = render_area[1] - render_area[0];
    const area_height = render_area[3] - render_area[2];
    sim_bg.style.width = area_width + "px";
    sim_bg.style.height = area_height + "px";

    // make sure the origin-point is always at the center of a grid square
    sim_bg.style.setProperty("--margin-left", (-render_area[0] % GRID_SIZE + GRID_SIZE / 2) + "px");
    sim_bg.style.setProperty("--margin-top", (revY(render_area[3] % GRID_SIZE + GRID_SIZE / 2)) + "px");

    var anchor_pos_before = [sim_anchor.offsetLeft, sim_anchor.offsetTop];

    // set anchor alignment
    sim_anchor.style.left = (-render_area[0]) + "px";
    sim_anchor.style.top = revY(render_area[3]) + "px";

    // adjust scroll to keep view stable
    var anchor_pos_after = [sim_anchor.offsetLeft, sim_anchor.offsetTop];
    var delta_pos = [anchor_pos_after[0] - anchor_pos_before[0], anchor_pos_after[1] - anchor_pos_before[1]];
    var sim_area_div = document.getElementById("center-zone");
    sim_area_div.scrollBy({
        left: delta_pos[0],
        top: delta_pos[1],
        behavior: 'instant',
    });
}

export { render_frame, render_area, setZoomLevel, getZoomLevel };