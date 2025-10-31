import { inspect_phyobj } from "../ui/inspector.js";
import { t } from "../i18n/i18n.js";
import { getMode, GlobalModes } from "../mode/global_mode.js";
import { monitor_phyobj } from "../ui/monitor.js";

function PhyObjOnClickEvent(world, phyobjid) {
    return function (event) {
        console.log("Clicked on phyobj id:", phyobjid);
        switch (getMode()) {
            case GlobalModes.EDIT:
                inspect_phyobj(world, phyobjid);
                break;
            case GlobalModes.SIMULATE:
                monitor_phyobj(world, phyobjid);
                break;
            case GlobalModes.KEYFRAME:
                inspect_phyobj(world, phyobjid);
                break;
        }

        // Additional click handling logic can be added here
    }
}

export { PhyObjOnClickEvent };