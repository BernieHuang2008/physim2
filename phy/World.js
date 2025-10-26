import { BasicPhyObject } from "./PhyObjects/basic.js";
import { Variable } from "./Var.js";
import { ForceField } from "./ForceField.js";
import {WorldAnchorPhyObject } from "./PhyObjects/WorldAnchor.js";

class World {
    phyobjs = {};
    vars = {};
    ffs = {};
    used_ids = new Set();
    anchor = null;

    constructor() {
        this.anchor = new WorldAnchorPhyObject(this);
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
}

export { World };