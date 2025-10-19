import { BasicPhyObject } from "./basic.js";

class ParticlePhyObject extends BasicPhyObject {
    // metadata
    type = "ParticlePO";
    nickname = "Untitled Particle";

    // constructor
    constructor(world, mass=1, pos=null, velocity=null, vars=[], ffs=[]) {
        super(world, mass, pos, velocity, vars, ffs);

        if (typeof mass === 'string') {
            this.mass.reset('m', mass, 'derived');
        }
        else {
            this.mass.reset('m', mass, 'immediate');
        }
    }
}

export { ParticlePhyObject };