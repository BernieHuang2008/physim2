import { t } from "../i18n/i18n.js";
import * as EditModeUtils from "./m_editMode.js";
import * as SimuModeUtils from "./m_simuMode.js";
import * as KeyframeModeUtils from "./m_kfMode.js";
import * as Noti from "../ui/notification/notification.js";

var MODE = "EDIT"; // "EDIT" | "SIMULATE" | "KEYFRAME"
const modeBadge = document.getElementById("mode-badge");
const secondStateBadge = document.getElementById("second-statebadge");

const modeutils = {
    "EDIT": EditModeUtils,
    "SIMULATE": SimuModeUtils,
    "KEYFRAME": KeyframeModeUtils,
}

function getMode() {
    return MODE;
}

function switchMode(newMode) {
    var isOK = modeutils[MODE].deinitMode();

    if (!isOK) {
        Noti.error(t("Mode Switch Aborted"), t("Current mode failed to clean up properly: ")+t(MODE));
        console.warn("Mode Switch Aborted.");
        return;
    }
    
    console.log("Mode Switch to:", newMode);

    MODE = newMode;
    document.body.dataset.mode = newMode;
    modeBadge.textContent = t(newMode);

    modeutils[newMode].initMode();
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