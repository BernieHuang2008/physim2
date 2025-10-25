import { UI_Section } from "./ui/ui_section.js";
import { $, $$ } from './utils.js';
import { math } from './phyEngine/math.js';
import { Variable } from './phy/Var.js';
import { setLanguage, getCurrentLanguage, t } from './i18n/i18n.js';

// =====

import { render_frame } from "./sim/render_frame.js";

import { World } from './phy/world.js';
import { ParticlePhyObject } from "./phy/PhyObjects/Particle.js";

// You can switch languages like this:
// setLanguage('zh'); // Switch to Chinese (when translations are added)
// console.log("After switching - Translated 'Inspector':", t("Inspector"));

var world = new World();
var a = new ParticlePhyObject(world, 3, [5, 0], [0, 0]);
var b = new ParticlePhyObject(world, "2*5", [10, 0], [0, 0]);

var v = new Variable("q", "", "derived");
b.vars.push(world.add_var(v));
v.update("2*5");


console.log(a);
console.log(b);

import { ForceField } from "./phy/ForceField.js";
import { edit_ff } from "./sim/ffeditor.js";

var ffi = new ForceField(world, "mass * [0, -10]", "true");
// var ffi = new ForceField(world, "((pos - [0, 0]) * (pos - [0, 0])) * (pos / sqrt(pos * pos))", "true");
b.ffs.push(ffi.id);
console.log(ffi);

render_frame(world);

edit_ff(world, ffi.id);
