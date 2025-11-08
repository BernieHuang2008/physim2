import { math } from '../../phyEngine/math.js';
import { IDObject } from '../idutils.js';
import { Variable } from '../Var.js';
import { t } from '../../i18n/i18n.js';

class BasicPhyObject extends IDObject {
    // metadata
    type = "BasicPO";
    nickname = t("Untitled Basic PhyObject");
    world = null;

    // physical properties
    mass;
    pos;
    velocity;
    vars;
    ffs;
    unreg_vars = [];

    constructor(world, mass = 0, pos = null, velocity = null, vars = [], ffs = [], id = null) {
        super();
        this.world = world;

        if (id) {
            this.id = id;
            world.add_phyobject_with_id(id, this);
        } else {
            world.add_phyobject(this);
        }

        this.mass =     world.vars["VAR_" + this.id + "_mass"]      || new Variable('m', mass, 'immediate', "VAR_" + this.id + "_mass");
        this.pos =      world.vars["VAR_" + this.id + "_pos"]       || new Variable('pos', pos || [0, 0], 'immediate', "VAR_" + this.id + "_pos");
        this.velocity = world.vars["VAR_" + this.id + "_velocity"]  || new Variable('velocity', velocity || [0, 0], 'immediate', "VAR_" + this.id + "_velocity");
        this.vars = vars;
        this.ffs = ffs;

        world.add(this.mass);
        world.add(this.pos);
        world.add(this.velocity);
    }

    reset_to_other(phyobject) {
        this.mass.reset_to_other(phyobject.mass);
        this.pos.reset_to_other(phyobject.pos);
        this.velocity.reset_to_other(phyobject.velocity);
        this.vars = phyobject.vars;
        this.ffs = phyobject.ffs;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            nickname: this.nickname,
            mass: this.mass.value,
            pos: this.pos.value,
            velocity: this.velocity.value,
            vars: this.vars,
            ffs: this.ffs
        };
    }
}

export { BasicPhyObject };