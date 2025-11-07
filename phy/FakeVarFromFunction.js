import { Variable } from "./Var.js";

class FakeVarFromFunction extends Variable {
    constructor (calc_func, nickname="Derived Variable", id=null) {
        super(nickname, null, "derived", id);
        this.calc = calc_func;
        this.world = {vars: {}};
    }

    update_expression(newExpression) {
        // No expression to update
    }
}

export { FakeVarFromFunction };