import { floating_section_expand, floatsec_utils_hide_all } from "../floatsec_utils.js";

const fpsControl = document.getElementById("fps-control");
const fpsDropdown = document.getElementById("fps-dropdown");

const fps_options = {
    "15 FPS": 15,
    "30 FPS": 30,
    "60 FPS": 60,
    "90 FPS": 90,
    "120 FPS": 120,
    "144 FPS": 144,
    "165 FPS": 165,
    "240 FPS": 240
}

let currentFPS = 60; // 默认FPS值

function fps_init() {
    // 初始化显示
    fpsControl.textContent = `60 FPS`;
    
    for (let label in fps_options) {
        const value = fps_options[label];
        const option = document.createElement("div");
        option.classList.add("epsilon-option");
        option.textContent = label;
        option.addEventListener("click", () => {
            currentFPS = value;
            fpsControl.textContent = `${label}`;
            floatsec_utils_hide_all();
            
            // TODO: 在这里添加实际的FPS控制逻辑
            console.log(`FPS changed to: ${value}`);
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

function getCurrentFPS() {
    return currentFPS;
}

export { fps_init, getCurrentFPS };