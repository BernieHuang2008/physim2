import { Variable } from "./Var.js";

class FakeVarFromFunction extends Variable {
    constructor (calc_func, nickname="FakeVar from Func", id=null, world=null) {
        super(nickname, null, "derived", id);
        this.calc = calc_func;
        this.world = world || {vars: {}};
    }

    update_expression(newExpression) {
        // No expression to update
    }
}

export { FakeVarFromFunction };