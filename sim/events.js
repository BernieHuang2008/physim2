import { inspect_phyobj } from "../ui/inspector.js";
import { t } from "../i18n/i18n.js";

function PhyObjOnClickEvent(world, phyobjid) {
    return function(event) {
        console.log("Clicked on phyobj id:", phyobjid);
        inspect_phyobj(world, phyobjid);
        // Additional click handling logic can be added here
    }
}

export { PhyObjOnClickEvent };