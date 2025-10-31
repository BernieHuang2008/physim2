/**
 * Physics Simulation Animation System
 * 
 * This module provides a robust animation framework that separates physics simulation
 * from visual rendering, allowing for smooth animations while maintaining physics accuracy.
 * 
 * Key Features:
 * - Fixed timestep physics simulation using the dt setting from simulation.js
 * - Variable timestep rendering at a specified FPS
 * - Frame skipping for performance optimization
 * - Protection against "spiral of death" in physics simulation
 * - Performance monitoring and statistics
 * 
 * How it works:
 * 1. Physics runs at a fixed timestep (SETTINGS.dt) regardless of rendering FPS
 * 2. Rendering runs at the target FPS (default 60 FPS)
 * 3. Multiple physics steps can run per render frame if needed
 * 4. Frames can be skipped if the system is under heavy load
 * 
 * Usage:
 * ```javascript
 * const controller = new AnimationController(simulation);
 * controller.start(60); // Start at 60 FPS
 * // ... animation runs automatically
 * controller.stop(); // Stop animation
 * ```
 */

import { render_frame } from "./render_frame.js";
import { SETTINGS } from "./simulation.js";

class AnimationController {
    constructor(simulation) {
        this.simulation = simulation;
        this.isRunning = false;
        this.animationId = null;
        this.lastFrameTime = 0;
        this.physicsAccumulator = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS; // milliseconds per frame
        this.frameCount = 0;
        this.lastFPSTime = 0;
        this.actualFPS = 0;
        this.maxPhysicsSteps = 10;
        
        // Adaptive rendering settings
        this.adaptiveRendering = true;
        this.renderSkipThreshold = 16.67; // Skip rendering if frame time > 16.67ms (60 FPS)
        this.framesSinceRender = 0;
        this.maxFramesToSkip = 2;
        
        // Performance tracking
        this.stats = {
            frameTime: 0,
            physicsTime: 0,
            renderTime: 0,
            framesSkipped: 0
        };
    }
    
    /**
     * Start the animation loop
     * @param {number} fps - Target frames per second (default: 60)
     * @param {number} maxPhysicsSteps - Maximum physics steps per frame to prevent spiral of death (default: 10)
     */
    start(fps = 60, maxPhysicsSteps = 10) {
        if (this.isRunning) {
            console.warn("Animation is already running");
            return;
        }
        
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
        this.maxPhysicsSteps = maxPhysicsSteps;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.lastFPSTime = this.lastFrameTime;
        this.frameCount = 0;
        this.physicsAccumulator = 0;
        
        console.log(`Starting animation at ${fps} FPS with physics dt=${SETTINGS.dt}s`);
        
        // Start the animation loop
        this.animationLoop();
    }
    
    /**
     * Stop the animation loop
     */
    stop() {
        if (!this.isRunning) {
            console.warn("Animation is not running");
            return;
        }
        
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        console.log("Animation stopped");
    }
    
    /**
     * Toggle animation on/off
     */
    toggle() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    /**
     * Main animation loop using requestAnimationFrame
     */
    animationLoop() {
        if (!this.isRunning) return;
        
        try {
            const currentTime = performance.now();
            const frameStartTime = currentTime;
            const deltaTime = currentTime - this.lastFrameTime;
            
            // Clamp deltaTime to prevent large jumps (e.g., when tab was inactive)
            const clampedDeltaTime = Math.min(deltaTime, 100); // Max 100ms
            
            // Convert to seconds for physics
            const frameDeltaSeconds = clampedDeltaTime / 1000;
            
            // Accumulate time for fixed timestep physics
            this.physicsAccumulator += frameDeltaSeconds;
            
            const physicsStartTime = performance.now();
            
            // Run physics simulation with fixed timestep
            let physicsSteps = 0;
            while (this.physicsAccumulator >= SETTINGS.dt && physicsSteps < this.maxPhysicsSteps) {
                this.simulation.simulate(SETTINGS.dt);
                this.physicsAccumulator -= SETTINGS.dt;
                physicsSteps++;
            }
            
            // If we hit the max steps limit, discard remaining time to prevent spiral of death
            if (physicsSteps >= this.maxPhysicsSteps) {
                this.physicsAccumulator = 0;
                console.warn(`Physics stepped ${physicsSteps} times in one frame. Discarding remaining time.`);
            }
            
            const physicsEndTime = performance.now();
            
            // Decide whether to render this frame
            const shouldRender = !this.adaptiveRendering || 
                               this.framesSinceRender >= this.maxFramesToSkip ||
                               (physicsEndTime - physicsStartTime) < this.renderSkipThreshold;
            
            let renderStartTime = physicsEndTime;
            let renderEndTime = physicsEndTime;
            
            if (shouldRender) {
                // Render frame
                renderStartTime = performance.now();
                render_frame(this.simulation.world, null, false);
                renderEndTime = performance.now();
                this.framesSinceRender = 0;
            } else {
                // Skip rendering to maintain performance
                this.framesSinceRender++;
                this.stats.framesSkipped++;
            }
            
            // Update performance stats
            this.stats.frameTime = currentTime - frameStartTime;
            this.stats.physicsTime = physicsEndTime - physicsStartTime;
            this.stats.renderTime = renderEndTime - renderStartTime;
            
            // Calculate FPS
            this.frameCount++;
            if (currentTime - this.lastFPSTime >= 1000) { // Every second
                this.actualFPS = this.frameCount / ((currentTime - this.lastFPSTime) / 1000);
                this.frameCount = 0;
                this.lastFPSTime = currentTime;
                
                // Optional: log performance stats
                if (this.frameCount % 60 === 0) { // Every 60 frames
                    this.logStats();
                }
            }
            
            this.lastFrameTime = currentTime;
            
            // Schedule next frame
            this.animationId = requestAnimationFrame(() => this.animationLoop());
            
        } catch (error) {
            console.error("Error in animation loop:", error);
            console.error("Stopping animation due to error");
            this.stop();
        }
    }
    
    /**
     * Log performance statistics
     */
    logStats() {
        console.log(`FPS: ${this.actualFPS.toFixed(1)} | Frame: ${this.stats.frameTime.toFixed(2)}ms | Physics: ${this.stats.physicsTime.toFixed(2)}ms | Render: ${this.stats.renderTime.toFixed(2)}ms | Skipped: ${this.stats.framesSkipped} | Sim Time: ${this.simulation.time.toFixed(3)}s`);
    }
    
    /**
     * Get current animation status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            targetFPS: this.targetFPS,
            actualFPS: this.actualFPS,
            simulationTime: this.simulation.time,
            physicsdt: SETTINGS.dt,
            stats: { ...this.stats }
        };
    }
    
    /**
     * Set target FPS
     */
    setFPS(fps) {
        this.targetFPS = fps;
        this.frameInterval = 1000 / fps;
        this.renderSkipThreshold = 1000 / fps; // Adjust skip threshold based on target FPS
        console.log(`Target FPS set to ${fps}`);
    }
    
    /**
     * Enable or disable adaptive rendering
     */
    setAdaptiveRendering(enabled) {
        this.adaptiveRendering = enabled;
        console.log(`Adaptive rendering ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Utility function for simple animation with default settings
function startSimulationAnimation(simulation, fps = 60) {
    const controller = new AnimationController(simulation);
    controller.start(fps);
    return controller;
}

// Utility function for step-by-step animation
function stepAnimation(simulation, steps = 1) {
    for (let i = 0; i < steps; i++) {
        simulation.simulate();
    }
    render_frame(simulation.world, null, false);
    console.log(`Stepped ${steps} physics step(s). Simulation time: ${simulation.time.toFixed(4)}s`);
}

// Utility function to simulate to a specific time
function simulateToTime(simulation, targetTime) {
    const startTime = simulation.time;
    simulation.simulate_to(targetTime);
    render_frame(simulation.world, null, false);
    console.log(`Simulated from ${startTime.toFixed(4)}s to ${targetTime.toFixed(4)}s`);
}

// Utility function to reset simulation to time 0
function resetSimulation(simulation) {
    simulation.restore_backup(0);
    render_frame(simulation.world, null, false);
    console.log("Simulation reset to time 0");
}

export { 
    AnimationController, 
    startSimulationAnimation, 
    stepAnimation,
    simulateToTime,
    resetSimulation
};