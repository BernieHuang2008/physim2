import { SETTINGS } from "../../sim/simulation.js";
import { floating_section_expand, floatsec_utils_hide_all } from "../floatsec_utils.js";

const fpsControl = document.getElementById("aspd-control");
const fpsDropdown = document.getElementById("fps-dropdown");

const fps_options = {
    "0.5x": 0.5,
    "1x": 1,
    "2x": 2,
    "4x": 4,
    "10x": 10,
    "100x": 100,

    "1s=1d": 24 * 3600,
    "1s=1m": 30 * 24 * 3600,
    "1s=1y": 365 * 24 * 3600,
}

let currentFPS = 60; // 默认FPS值

function aspd_init() {
    // 初始化显示
    fpsControl.textContent = `⏭ 1x`;
    
    for (let label in fps_options) {
        const value = fps_options[label];
        const option = document.createElement("div");
        option.classList.add("epsilon-option");
        option.textContent = label;
        option.addEventListener("click", () => {
            currentFPS = value;
            fpsControl.textContent = `⏭ ${label}`;
            floatsec_utils_hide_all();
            
            SETTINGS.aniSpeed = value;
            console.log(`Animation speed changed to: ${value}`);
        });
        fpsDropdown.appendChild(option);
    }

    fpsControl.addEventListener("click", () => {
        if (fpsDropdown.classList.contains("hide")) {
            // Show dropdown
            fpsDropdown.style.left = (fpsControl.getBoundingClientRect().left) + "px";
            fpsDropdown.classList.remove("hide");
            floating_section_expand();
        }
    });
}

export { aspd_init };