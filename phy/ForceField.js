import { math } from '../phyEngine/math.js';
import { IDObject } from './idutils.js';
import { t } from '../i18n/i18n.js';
import { po_type_encode } from '../utils.js';

class ForceField extends IDObject {
    // metadata
    type = "FFI";
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
    constructor(world, expression = "", condition = "", nickname = t("Untitled Force Field"), id = null) {
        super();
        this.world = world;
        this.expression = expression;
        this.condition = condition;
        this.compiled_expression = math.compile(expression);
        this.compiled_condition = math.compile(condition);
        this.nickname = nickname;

        if (id) {
            this.id = id;
            world.add_ff_with_id(id, this);
        } else {
            world.add_ff(this);
        }
    }

    reset(condition, expression) {
        this.condition = condition;
        this.expression = expression;
        this.compiled_condition = math.compile(condition);
        this.compiled_expression = math.compile(expression);
    }

    reset_to_other(forcefield) {
        this.reset(forcefield.condition, forcefield.expression);
        this.nickname = forcefield.nickname;
        this.template = Object.assign({}, forcefield.template);
    }

    _compute_scope(phyobject, time, vars = {}, total_force = null) {
        // runtime states
        var scope = {
            pos: phyobject.pos.value,
            v: phyobject.velocity.value,
            mass: phyobject.mass.value,
            time: time,
            dt: 1 / 128, // precise dt will be passed in vars
            type: po_type_encode(phyobject.type),
        };

        if (total_force) {
            scope.F = total_force;
            scope.a = [
                total_force[0] / phyobject.mass.value || 0,
                total_force[1] / phyobject.mass.value || 0
            ];
        }

        // target vars (by nickname)
        var target_vars = {};
        for (let varid of phyobject.vars) {
            let v = phyobject.world.vars[varid];
            target_vars["TARGET_" + v.nickname] = v.value;
        }
        scope = Object.assign(scope, target_vars);

        // world vars (by id)
        scope = Object.assign({}, scope, vars);
        for (let varid in this.world.vars) {
            let v = this.world.vars[varid];
            scope[v.id] = v.value;
        }

        return scope;
    }

    judge_condition(phyobject, time, vars = {}) {
        var scope = this._compute_scope(phyobject, time, vars);

        // evaluate condition
        var condition = this.compiled_condition.evaluate(scope);
        return condition === true;
    }

    _compute_force(phyobject, time, vars = {}, total_force = null) {
        var scope = this._compute_scope(phyobject, time, vars, total_force);

        // evaluate condition
        var condition = this.compiled_condition.evaluate(scope);
        if (condition === false) {
            return null;
        }

        // calculate force
        var force = this.compiled_expression.evaluate(scope);
        return Array.isArray(force) ? force : force._data;
    }

    compute_force(phyobject, time, vars = {}) {
        if (this.type !== "FFI") {
            throw new Error("ForceField.compute_force() should not be called on derived ForceField types!");
        }
        return this._compute_force(phyobject, time, vars);
    }

    _master = null;
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

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            nickname: this.nickname,
            expression: this.expression,
            condition: this.condition,
            template: this.template,
        };
    }
    static fromJSON(json, world) {
        const ff = new ForceField(
            world,
            json.expression,
            json.condition,
            json.nickname,
            json.id
        );
        ff.nickname = json.nickname;
        ff.expression = json.expression;
        ff.condition = json.condition;
        ff.compiled_expression = math.compile(ff.expression);
        ff.compiled_condition = math.compile(ff.condition);
        ff.template = json.template || {
            type: "custom",
            params: {}
        };
        return ff;
    }
}

// FFD will mostly be processed outside ForceField class
// 1. in 'Simulation' class, FFD is the last FF to be processed in each step
// 2. FFD can use extra info (F for total force, a for acceleration) in its expression
class ForceFieldDerived extends ForceField {
    type = "FFD";
    constructor(world, expression = "", condition = "", nickname = t("Untitled Derived Force Field"), id = null) {
        super(world, expression, condition, nickname, id);
    }

    compute_force_ffd(phyobject, time, vars = {}, total_force = [0, 0]) {
        return this._compute_force(phyobject, time, vars, total_force);
    }

    static fromJSON(json, world) {
        const ff = new ForceFieldDerived(
            world, json.expression, json.condition, json.nickname, json.id
        );
        ff.nickname = json.nickname;
        ff.expression = json.expression;
        ff.condition = json.condition;
        ff.compiled_expression = math.compile(ff.expression);
        ff.compiled_condition = math.compile(ff.condition);
        ff.template = json.template || {
            type: "custom",
            params: {}
        };
        return ff;
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

export { ForceField, ForceFieldDerived, FakeVar_FFExpression, FakeVar_FFCondition };