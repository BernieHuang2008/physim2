import { t } from "../../i18n/i18n.js";
import { ParticlePhyObject } from "./Particle.js";

class RigidbodyPhyObject extends ParticlePhyObject {
    // metadata
    type = "RigidbodyPO";
    nickname = t("Untitled Rigidbody");

    // constructor
    constructor(world, radius = 1, mass = 1, pos = null, velocity = null, vars = [], ffs = [], style = null, id = null) {
        super(world, mass, pos, velocity, vars, ffs, style, id);
        this.radius =     world.vars["VAR_" + this.id + "_radius"]      || new Variable('r', radius, 'immediate', "VAR_" + this.id + "_radius");
        world.add(this.radius);

        if (mass !== "DONTSET") {
            if (typeof mass === 'string') {
                this.mass.reset('m', mass, 'derived');
            }
            else {
                this.mass.reset('m', mass, 'immediate');
            }
        }

        // add ff based on radius
    }
}

export { RigidbodyPhyObject };