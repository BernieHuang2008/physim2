import { globalWorld, World } from "../phy/World.js";
import * as varmon from "../ui/var_monitor.js";
import { scheduleRender } from "../sim/render_frame.js";
import { inspect_phyobj } from "../ui/inspector.js";


function pack() {
    return {
        version: "file-v2",
        world: globalWorld.toJSON(),
        varmon: varmon.export_json(),
    };
}

function load(json) {
    if (json.version !== "file-v2") {
        alert("Unsupported file version: " + json.version);
        return;
    }
    globalWorld.reset(World.fromJSON(json.world));

    if (json.varmon) {
        varmon.import_json(json.varmon);
    }

    scheduleRender(globalWorld, globalWorld.anchor, false, () => inspect_phyobj(globalWorld, globalWorld.anchor));
}

export default {
    pack,
    load,
};