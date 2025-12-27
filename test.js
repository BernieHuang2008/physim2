import { UI_Section } from "./ui/ui_section/ui_section.js";
import { $, $$ } from './utils.js';
import { math } from './phyEngine/math.js';
import { Variable } from './phy/Var.js';
import { setLanguage, getCurrentLanguage, t } from './i18n/i18n.js';

// =====

import { render_frame } from "./sim/render_frame.js";

import { World, globalWorld } from './phy/World.js';
import { ParticlePhyObject } from "./phy/PhyObjects/Particle.js";
import { RigidbodyPhyObject } from "./phy/PhyObjects/Rigidbody.js";

// You can switch languages like this:
// setLanguage('zh'); // Switch to Chinese (when translations are added)
// console.log("After switching - Translated 'Inspector':", t("Inspector"));

var world = window.world = globalWorld;
console.log("globalWorld:", globalWorld);
switchMode("EDIT");

var a = new ParticlePhyObject(world, 3, [0, 0], [0, 0]);
var b = new ParticlePhyObject(world, "2*5", [0, 0], [0, 0]);
// var c = new RigidbodyPhyObject(world, 2, 4, [5, 5], [0, 0]);

// var v = new Variable("example_var", "", "derived");
// b.vars.push(world.add_var(v));
// v.update("2*5");


// console.log(a);
// console.log(b);
// console.log(c);

import { ForceField } from "./phy/ForceField.js";
import { edit_ff } from "./ui/ffeditor.js";
import { inspect_phyobj } from "./ui/inspector.js";
import * as Noti from "./ui/notification/notification.js";

// var ffi = new ForceField(world, "mass * [0, -10]", "true");
// var ffi = new ForceField(world, "((pos - [0, 0]) * (pos - [0, 0])) * (pos / sqrt(pos * pos))", "true");
// var ffi = new ForceField(world, "mass * [0, -9.8]", "true");
// b.ffs.push(ffi.id);
// console.log(ffi);

render_frame(world);

inspect_phyobj(world, world.anchor);
// edit_ff(world, ffi.id);
// Noti.error("hello", "This is a test notification!", console.log, -1);
// Noti.warning("hello", "This is a test notification!", console.log, -1);
// Noti.info("hello", "This is a test notification!", console.log, -1);
// Noti.error("hello", "This is a test notification!", console.log, -1);

// ======
import { globalSimulation, Simulation } from "./sim/simulation.js";
import { switchMode } from "./mode/global_mode.js";

var sim = globalSimulation;
sim.backup(0);
