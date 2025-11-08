import { SETTINGS } from "../../sim/simulation.js";
import { floating_section_expand, floatsec_utils_hide_all } from "../floatsec_utils.js";

const epsilonControl = document.getElementById("epsilon-control");
const epsilonDropdown = document.getElementById("epsilon-dropdown");

const epsilon_options = {
    "1": 1,
    "1/2": 1 / 2,
    "1/4": 1 / 4,
    // "1/8": 1 / 8,
    // "1/16": 1 / 16,
    "1/32": 1 / 32,
    // "1/64": 1 / 64,
    "1/128": 1 / 128,
    // "1/256": 1 / 256,
    "1/512": 1 / 512,
    "1/1024": 1 / 1024,
    "1/1e4": 1 / 16384,
    "1/1e5": 1 / 131072,
};

function epsilon_init() {
    for (let label in epsilon_options) {
        const value = epsilon_options[label];
        const option = document.createElement("div");
        option.classList.add("epsilon-option");
        option.textContent = label;
        option.addEventListener("click", () => {
            SETTINGS.epsilon = value;
            epsilonControl.textContent = `ε: ${label}`;
            floatsec_utils_hide_all();
        });
        epsilonDropdown.appendChild(option);
    }

    epsilonControl.addEventListener("click", () => {
        if (epsilonDropdown.classList.contains("hide")) {
            // Show dropdown
            epsilonDropdown.style.left = (epsilonControl.getBoundingClientRect().left) + "px";
            epsilonDropdown.classList.remove("hide");
            floating_section_expand();
        }
    });
}

export { epsilon_init };
