import { BasicPhyObject } from "./basic.js";
import { t } from "../../i18n/i18n.js";

class ParticlePhyObject extends BasicPhyObject {
    // metadata
    type = "ParticlePO";
    nickname = t("Untitled Particle");

    // constructor
    constructor(world, mass = 1, pos = null, velocity = null, vars = [], ffs = [], style = null, id = null) {
        super(world, mass, pos, velocity, vars, ffs, style, id);

        if (mass !== "DONTSET") {
            if (typeof mass === 'string') {
                this.mass.reset('m', mass, 'derived');
            }
            else {
                this.mass.reset('m', mass, 'immediate');
            }
        }
    }
}

export { ParticlePhyObject };