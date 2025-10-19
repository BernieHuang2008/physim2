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
    constructor(world, expression = "", condition = "") {
        super();
        this.world = world;
        this.expression = expression;
        this.condition = condition;
        this.compiled_expression = math.compile(expression);
        this.compiled_condition = math.compile(condition);

        world.add(this);
    }

    compute_force(phyobject, time, vars={}) {
        var scope = {
            pos: phyobject.pos,
            v: phyobject.velocity,
            mass: phyobject.mass,
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
        return force;
    }
}

export { ForceField };