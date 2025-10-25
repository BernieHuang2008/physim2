import { math } from '../phyEngine/math.js';
import { IDObject } from './idutils.js';

class ForceField extends IDObject {
    // metadata
    type = "FF";
    nickname = "Untitled Force Field";
    world = null;

    expression = null;
    condition = null;
    compiled_expression = null;
    compiled_condition = null;

    /*
    vars can be used: time, pos (target), v (target), mass (target), TARGET_varNickname (var of target), VAR_varid
    */
    constructor(world, expression = "", condition = "", nickname = "Untitled Force Field") {
        super();
        this.world = world;
        this.expression = expression;
        this.condition = condition;
        this.compiled_expression = math.compile(expression);
        this.compiled_condition = math.compile(condition);
        this.nickname = nickname;

        world.add(this);
    }

    compute_force(phyobject, time, vars={}) {
        var scope = {
            pos: phyobject.pos.value,
            v: phyobject.velocity.value,
            mass: phyobject.mass.value,
            time: time,
        };
        var target_vars = {};
        for (let varid in phyobject.vars) {
            let v = phyobject.world.vars[varid];
            target_vars["TARGET_" + v.nickname] = v.value;
        }
        scope = Object.assign(scope, vars);

        var condition = this.compiled_condition.evaluate(scope);
        if (condition === false) {
            return null;
        }

        var force = this.compiled_expression.evaluate(scope);
        return Array.isArray(force) ? force : force._data;
    }
}

class FakeVar_FF {
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
        this.ff.expression = newExpression;
        this.ff.compiled_expression = math.compile(newExpression);
    }

    get value() {
        return null;
    }

    set value(newValue) {
        this.ff.expression = newValue;
        this.ff.compiled_expression = math.compile(newValue);
    }

    _getDependencies() {
        return [];
    }

    reset(nickname, value, type = "immediate") {
        this.ff.nickname = nickname;
        this.ff.expression = value;
        this.ff.compiled_expression = math.compile(value);
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

export { ForceField, FakeVar_FF };