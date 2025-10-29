import { BasicPhyObject } from "./basic.js";
import { t } from "../../i18n/i18n.js";

class WorldAnchorPhyObject extends BasicPhyObject {
    // metadata
    type = "WorldAnchorPO";
    nickname = t("World Settings");

    // constructor
    constructor(world, id = null) {
        super(world, Infinity, [0, 0], [0, 0], [], [], id);
    }
}

export { WorldAnchorPhyObject };