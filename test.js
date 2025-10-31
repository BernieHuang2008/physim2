import { UI_Section } from "./ui/ui_section/ui_section.js";
import { $, $$ } from './utils.js';
import { math } from './phyEngine/math.js';
import { Variable } from './phy/Var.js';
import { setLanguage, getCurrentLanguage, t } from './i18n/i18n.js';

// =====

import { render_frame } from "./sim/render_frame.js";

import { World, globalWorld } from './phy/World.js';
import { ParticlePhyObject } from "./phy/PhyObjects/Particle.js";

// You can switch languages like this:
// setLanguage('zh'); // Switch to Chinese (when translations are added)
// console.log("After switching - Translated 'Inspector':", t("Inspector"));

var world = window.world = globalWorld;
console.log("globalWorld:", globalWorld);
var a = new ParticlePhyObject(world, 3, [0, 0], [0, 0]);
var b = new ParticlePhyObject(world, "2*5", [10, 0], [0, 0]);

var v = new Variable("example_var", "", "derived");
b.vars.push(world.add_var(v));
v.update("2*5");


console.log(a);
console.log(b);

import { ForceField } from "./phy/ForceField.js";
import { edit_ff } from "./ui/ffeditor.js";
import { inspect_phyobj } from "./ui/inspector.js";
import * as Noti from "./ui/notification/notification.js";

// var ffi = new ForceField(world, "mass * [0, -10]", "true");
// var ffi = new ForceField(world, "((pos - [0, 0]) * (pos - [0, 0])) * (pos / sqrt(pos * pos))", "true");
var ffi = new ForceField(world, "mass * [0, -9.8]", "true");
b.ffs.push(ffi.id);
console.log(ffi);

render_frame(world);

inspect_phyobj(world, world.anchor);
// edit_ff(world, ffi.id);
// Noti.error("hello", "This is a test notification!", console.log, -1);
// Noti.warning("hello", "This is a test notification!", console.log, -1);
// Noti.info("hello", "This is a test notification!", console.log, -1);
// Noti.error("hello", "This is a test notification!", console.log, -1);

// ======
import { globalSimulation, Simulation } from "./sim/simulation.js";
import { AnimationController, startSimulationAnimation, stepAnimation, simulateToTime, resetSimulation } from "./sim/animation.js";

var sim = globalSimulation;
sim.backup(0);

// Global animation controller for easy access
window.animationController = null;

function sim_with_animation(fps = 60) {
    // Stop existing animation if running
    if (window.animationController && window.animationController.isRunning) {
        window.animationController.stop();
    }
    
    // Create new animation controller
    window.animationController = new AnimationController(sim);
    
    // Start animation
    window.animationController.start(fps);
    
    console.log(`Started simulation animation at ${fps} FPS`);
    console.log("Use stopAnimation() to stop, or toggleAnimation() to toggle");
    
    return window.animationController;
}

// Convenience functions for global access
function stopAnimation() {
    if (window.animationController) {
        window.animationController.stop();
    }
}

function toggleAnimation() {
    if (window.animationController) {
        window.animationController.toggle();
    }
}

function stepAnimation_helper(steps = 1) {
    stepAnimation(sim, steps);
}

function simulateToTime_helper(targetTime) {
    simulateToTime(sim, targetTime);
}

function resetSimulation_helper() {
    resetSimulation(sim);
}

function getAnimationStatus() {
    if (window.animationController) {
        return window.animationController.getStatus();
    }
    return { isRunning: false };
}

// Make functions available globally for console access
window.sim_with_animation = sim_with_animation;
window.stopAnimation = stopAnimation;
window.toggleAnimation = toggleAnimation;
window.stepAnimation = stepAnimation_helper;
window.simulateToTime = simulateToTime_helper;
window.resetSimulation = resetSimulation_helper;
window.getAnimationStatus = getAnimationStatus;
window.sim = sim;

// Display usage instructions
console.log("\n=== Animation Controls ===");
console.log("sim_with_animation(60) - Start animation at 60 FPS");
console.log("sim_with_animation(30) - Start animation at 30 FPS");
console.log("stopAnimation() - Stop the animation");
console.log("toggleAnimation() - Toggle animation on/off");
console.log("stepAnimation(5) - Step 5 physics frames manually");
console.log("simulateToTime(10) - Simulate to 10 seconds");
console.log("resetSimulation() - Reset simulation to time 0");
console.log("getAnimationStatus() - Get current animation status");
console.log("========================\n");