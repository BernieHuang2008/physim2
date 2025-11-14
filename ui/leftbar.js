import { t } from "../i18n/i18n.js";
import { globalWorld } from "../phy/World.js";
import { $, $$ } from "../utils.js";
import * as Noti from "./notification/notification.js";
import * as PhyObjects from "../phy/PhyObjects/phyobjects.js";
import { render_frame } from "../sim/render_frame.js";

const leftBar = $("#left-bar");

function add_particle() {
    new PhyObjects.ParticlePhyObject(globalWorld, 1, [0, 0], [0, 0]);
    Noti.info(t("Add Particle"), t("A new particle has been added to the world."), null, 3);
    render_frame(globalWorld);
}

const leftBarShortcuts = [
    {
        name: t("Add Particle"),
        icon: "add_particle.svg",
        action: add_particle,
    },
    {
        name: t("Add Particle"),
        icon: "add_rigidbody.svg",
        action: add_particle,
    }
];

function createLeftBar() {
    leftBarShortcuts.forEach(shortcut => {
        const btn = document.createElement("button");
        btn.className = "left-bar-btn";
        btn.title = shortcut.name;
        // btn.style.backgroundImage = `url(./assets/icons/${shortcut.icon })`;
        const img = document.createElement("img");
        img.src = `./assets/icons/${shortcut.icon}`;
        img.alt = shortcut.name;
        btn.appendChild(img);
        btn.addEventListener("click", shortcut.action);
        leftBar.appendChild(btn);
    });
}

export { createLeftBar };

