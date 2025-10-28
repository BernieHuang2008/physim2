import { BasicPhyObject } from "./PhyObjects/basic.js";
import { Variable } from "./Var.js";
import { ForceField } from "./ForceField.js";
import { WorldAnchorPhyObject } from "./PhyObjects/WorldAnchor.js";

class World {
    phyobjs = {};
    vars = {};
    ffs = {};
    used_ids = new Set();
    anchor = null;

    constructor() {
        var anchor = new WorldAnchorPhyObject(this);
        this.anchor = anchor.id;
    }

    _genid(prefix = "UNI") {
        let id = prefix + "_" + Math.random().toString(36).substr(2, 9).toUpperCase();
        while (this.used_ids.has(id)) {
            id = prefix + "_" + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
        this.used_ids.add(id);
        return id;
    }

    add_phyobject(phyobject) {
        let id = this._genid("OBJ");
        this.add_phyobject_with_id(id, phyobject);

        phyobject.id = id;
        return id;
    }

    add_phyobject_with_id(id, phyobject) {
        this.phyobjs[id] = phyobject;
        phyobject.world = this;
        this.used_ids.add(id);
    }

    add_var(variable) {
        let v_id = this._genid("VAR");
        this.vars[v_id] = variable;
        variable.id = v_id;
        variable.world = this;

        return variable.id;
    }

    add_ff(forcefield) {
        let ff_id = this._genid(forcefield.type);
        this.add_ff_with_id(ff_id, forcefield);

        forcefield.id = ff_id;
        return forcefield.id;
    }

    add_ff_with_id(id, forcefield) {
        this.ffs[id] = forcefield;
        forcefield.world = this;
        this.used_ids.add(id);
    }

    add(x) {
        if (x instanceof BasicPhyObject) {
            return this.add_phyobject(x);
        } else if (x instanceof Variable) {
            return this.add_var(x);
        } else if (x instanceof ForceField) {
            return this.add_ff(x);
        }
    }

    toJSON() {
        const result = {};

        // Convert phyobjs
        result.phyobjs = {};
        for (const [id, obj] of Object.entries(this.phyobjs)) {
            result.phyobjs[id] = obj.toJSON();
        }

        // Convert vars
        result.vars = {};
        for (const [id, variable] of Object.entries(this.vars)) {
            result.vars[id] = variable.toJSON();
        }

        // Convert force fields
        result.ffs = {};
        for (const [id, ff] of Object.entries(this.ffs)) {
            result.ffs[id] = ff.toJSON();
        }

        result.used_ids = Array.from(this.used_ids);
        result.anchor = this.anchor;

        return result;
    }

    static fromJSON(json) {
        const world = new World();

        // Clear existing data
        world.phyobjs = {};
        world.vars = {};
        world.ffs = {};
        world.used_ids = new Set(json.used_ids);
        world.anchor = json.anchor;

        // Reconstruct phyobjs
        for (const [id, objData] of Object.entries(json.phyobjs)) {
            const obj = BasicPhyObject.fromJSON(objData, world);
            world.phyobjs[id] = obj;
        }
        // Reconstruct vars
        for (const [id, varData] of Object.entries(json.vars)) {
            const variable = Variable.fromJSON(varData, world);
            world.vars[id] = variable;
        }
        // Reconstruct force fields
        for (const [id, ffData] of Object.entries(json.ffs)) {
            const ff = ForceField.fromJSON(ffData, world);
            world.ffs[id] = ff;
        }
    }
}

export { World };