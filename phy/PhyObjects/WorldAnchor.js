import { BasicPhyObject } from "./basic.js";

class WorldAnchorPhyObject extends BasicPhyObject {
    // metadata
    type = "WorldAnchorPO";
    nickname = "World Anchor Point";

    // constructor
    constructor(world) {
        super(world, Infinity, [0, 0], [0, 0], [], []);
    }
}

export { WorldAnchorPhyObject };