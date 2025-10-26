import { math } from '../phyEngine/math.js';
import { IDObject } from './idutils.js';
import { t } from '../i18n/i18n.js';

class ForceField extends IDObject {
    // metadata
    type = "FF";
    nickname = t("Untitled Force Field");
    world = null;

    expression = null;
    condition = null;
    compiled_expression = null;
    compiled_condition = null;

    template = {
        type: "custom",
        params: {}
    }

    /*
    vars can be used: time, pos (target), v (target), mass (target), TARGET_varNickname (var of target), VAR_varid
    */
    constructor(world, expression = "", condition = "", nickname = t("Untitled Force Field")) {
        super();
        this.world = world;
        this.expression = expression;
        this.condition = condition;
        this.compiled_expression = math.compile(expression);
        this.compiled_condition = math.compile(condition);
        this.nickname = nickname;

        world.add(this);
    }

    reset(condition, expression) {
        this.condition = condition;
        this.expression = expression;
        this.compiled_condition = math.compile(condition);
        this.compiled_expression = math.compile(expression);
    }

    compute_force(phyobject, time, vars={}) {
        // runtime states
        var scope = {
            pos: phyobject.pos.value,
            v: phyobject.velocity.value,
            mass: phyobject.mass.value,
            time: time,
        };

        // target vars (by nickname)
        var target_vars = {};
        for (let varid in phyobject.vars) {
            let v = phyobject.world.vars[varid];
            target_vars["TARGET_" + v.nickname] = v.value;
        }
        scope = Object.assign(scope, vars);

        // world vars (by id)
        for (let varid in this.world.vars) {
            let v = this.world.vars[varid];
            scope[v.id] = v.value;
        }

        // evaluate condition
        var condition = this.compiled_condition.evaluate(scope);
        if (condition === false) {
            return null;
        }

        // calculate force
        var force = this.compiled_expression.evaluate(scope);
        return Array.isArray(force) ? force : force._data;
    }

    _master=null;
    get master_phyobj() {
        if (this._master) {
            return this._master;
        }

        for (let phyobj_id in this.world.phyobjs) {
            let phyobj = this.world.phyobjs[phyobj_id];
            if (phyobj.ffs.includes(this.id)) {
                this._master = phyobj;
                break;
            }
        }

        return this._master;
    }

    clear_template_params() {
        // prev-do: find the master of ff
        let ff_master_phyobj = this.master_phyobj;

        // prev-do: clear previous params from master phyobj
        for (let pname in this.template.params) {
            let varid = this.template.params[pname];
            // from world
            delete this.world.vars[varid];
            // from master phyobj
            var index = ff_master_phyobj.vars.indexOf(varid);
            if (index !== -1) {
                ff_master_phyobj.vars.splice(index, 1);
            }
        }

        this.template.params = {};
    }
}

class FakeVar_FFExpression {
    type = "derived";
    nickname;

    constructor(ff) {
        this.ff = ff;
        this.nickname = ff.nickname;
    }

    get expression() {
        return this.ff.expression;
    }

    set expression(newExpression) {
        this.ff.reset(this.ff.condition, newExpression);
        // this.ff.clear_template_params();
        this.ff.template.type = "custom";
    }

    get value() {
        return null;    // disable the calculation preview
    }

    set value(newValue) {
        this.expression = newValue;
    }

    get world() {
        return this.ff.world;
    }

    _getDependencies() {
        return [];
    }

    reset(nickname, value, type = "immediate") {
        this.ff.nickname = nickname;
        this.expression = value;
    }

    resetWithParams({ nickname, value, type = "immediate" }) {
        this.reset(nickname || this.nickname, value, type);
    }

    checkCircularDependency() {
        return {
            hasCycle: false,
            cyclePath: [],
            message: "No circular dependency found"
        };
    }
}

class FakeVar_FFCondition extends FakeVar_FFExpression {
    get expression() {
        return this.ff.condition;
    }
    set expression(newCondition) {
        this.ff.reset(newCondition, this.ff.expression);
        // this.ff.clear_template_params();
        this.ff.template.type = "custom";
    }
}

export { ForceField, FakeVar_FFExpression, FakeVar_FFCondition };