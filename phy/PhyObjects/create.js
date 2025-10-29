import * as PhyObjects from './phyobjects.js'

function createPOFromJSON(json, world) {
    var obj;

    switch (json.type) {
        case 'ParticlePO':
            obj = new PhyObjects.ParticlePhyObject(
                world,
                "DONTSET",
                "DONTSET",
                "DONTSET",
                json.vars,
                json.ffs,
                json.id
            );
            break;
        case 'WorldAnchorPO':
            obj = new PhyObjects.WorldAnchorPhyObject(world, json.id);
            break;
        default:
            obj = new PhyObjects.BasicPhyObject(
                world,
                json.mass,
                json.pos,
                json.velocity,
                json.vars,
                json.ffs,
                json.id
            );
    }
    obj.nickname = json.nickname;
    return obj;
}

export { createPOFromJSON };