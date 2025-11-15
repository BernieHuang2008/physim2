import { t } from "../../i18n/i18n.js";
import { po_type_encode } from "../../utils.js";
import { ForceField, ForceFieldDerived } from "../ForceField.js";
import { Variable } from "../Var.js";
import { ParticlePhyObject } from "./Particle.js";

class RigidbodyPhyObject extends ParticlePhyObject {
    // metadata
    type = "RigidbodyPO";
    nickname = t("Untitled Rigidbody");

    // display property
    style = {
        color: "#0b870b",
        size_var: null
    }

    // constructor
    constructor(world, radius = 1, mass = 1, pos = null, velocity = null, vars = [], ffs = [], style = null, id = null) {
        super(world, mass, pos, velocity, vars, ffs, style, id);

        // creat radius var
        if (typeof radius === 'number') {
            var r = new Variable("radius", radius, 'immediate');
            this.vars.push(world.add_var(r));
        } else if (typeof radius === 'string') {
            var r = world.vars[radius] || new Variable("radius", 1, 'immediate', radius);
        }

        this.radius = r;
        this.style.size_var = r;

        if (mass !== "DONTSET") {
            if (typeof mass === 'string') {
                this.mass.reset('m', mass, 'derived');
            }
            else {
                this.mass.reset('m', mass, 'immediate');
            }
        }

        // console.log(this.vars);

        // add ff based on radius
        if (id === null) this.add_ff_by_radius();
    }

    add_ff_by_radius() {
        var condition = `norm(pos - ${this.pos.id})    and     (type==${po_type_encode("ParticlePO")} and norm(pos - ${this.pos.id}) <= ${this.radius.id})     or     (type==${po_type_encode("RigidbodyPO")} and norm(pos - ${this.pos.id}) <= (${this.radius.id} + TARGET_radius))`;
        //               ^ not at same pos                     ^ particle-rigidbody collision: d < r                                                                  ^ rigidbody-rigidbody collision: d < r1 + r2

        {   // Add acc-neutralize FFD
            let ffd_expression = `max(-a * ((pos - ${this.pos.id})/norm(pos - ${this.pos.id})), 0)       *     ((pos - ${this.pos.id})/norm(pos - ${this.pos.id}))    *   mass`;
            //                        ^ acc dot product to get radial-acc                                       ^ direction                                                ^ F=ma

            let ffd_nickname = t("Rigidbody Collision FFD (acc-neutralize)");
            let ffd = new ForceFieldDerived(this.world, ffd_expression, condition, ffd_nickname);
            this.ffs.push(ffd.id);
        }

        {   // Add vel-neutralize FFD
            let ffi_expression = `max(-v * ((pos - ${this.pos.id})/norm(pos - ${this.pos.id})), 0)       *     ((pos - ${this.pos.id})/norm(pos - ${this.pos.id}))    /   dt   *   mass`;
            //                        ^ vel dot product to get radial-vel                                       ^ direction                                                ^ a=v/t  ^ F=ma

            let ffi_nickname = t("Rigidbody Collision FFD (vel-neutralize)");
            let ffi = new ForceField(this.world, ffi_expression, condition, ffi_nickname);
            this.ffs.push(ffi.id);
        }
    }

    reset_to_other(phyobject) {
        // super.reset_to_other(phyobject);
        this.radius.reset_to_other(phyobject.radius);
    }

    toJSON() {
        let json = super.toJSON();
        json.radius = this.radius.id;
        return json;
    }
}

export { RigidbodyPhyObject };