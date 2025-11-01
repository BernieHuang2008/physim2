import { t } from "../i18n/i18n.js";

var MODE = "EDIT"; // "EDIT" | "SIMULATE" | "KEYFRAME"
const modeBadge = document.getElementById("mode-badge");
const secondStateBadge = document.getElementById("second-statebadge");

function getMode() {
    return MODE;
}

function switchMode(newMode) {
    MODE = newMode;
    document.body.dataset.mode = newMode;
    modeBadge.textContent = t(newMode);
}

function assertMode(allowed_mode_list) {
    for (var mode of allowed_mode_list) {
        if (MODE === mode) {
            return true;
        }
    }

    throw Error(`Mode Assertion Failed. Current mode [${MODE}]; Allowed modes [${allowed_mode_list}].`);
}

const GlobalModes = {
    EDIT: "EDIT",
    SIMULATE: "SIMULATE",
    KEYFRAME: "KEYFRAME"
}

export { getMode, switchMode, assertMode, GlobalModes };