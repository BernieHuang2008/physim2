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

    constructor(world, mass=0, pos=null, velocity=null, vars=[], ffs=[]) {
        super();
        this.world = world;
        this.mass = new Variable('m', mass, 'immediate');
        this.pos = new Variable('pos', pos || [0, 0], 'immediate');
        this.velocity = new Variable('velocity', velocity || [0, 0], 'immediate');
        this.vars = vars;
        this.ffs = ffs;

        world.add(this);
        world.add(this.mass);
        world.add(this.pos);
        world.add(this.velocity);
    }

    toJSON() {
        return {
            id: this.id,
            nickname: this.nickname,
            mass: this.mass.value,
            pos: this.pos.value,
            velocity: this.velocity.value,
            vars: this.vars,
            ffs: this.ffs
        };
    }

    static fromJSON(json, world) {
        const obj = new BasicPhyObject(
            world,
            json.mass,
            json.pos,
            json.velocity,
            json.vars,
            json.ffs
        );
        obj.id = json.id;
        obj.nickname = json.nickname;
        return obj;
    }
}

export { BasicPhyObject };