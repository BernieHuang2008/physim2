import { World, globalWorld } from "../phy/World.js";

const SETTINGS = {
    backup_frequency: 30, // simulation steps
    dt: 1 / 128,
}

class Simulation {
    backups = {};
    time = 0;

    constructor(world) {
        this.world = world;
        // initial backup
        this.backups[0] = this.world.toJSON();
    }

    simulate(dt = null) {
        debugger;
        dt = dt || SETTINGS.dt;

        /* prev_state: this.world */
        this.time += dt;

        // 1. Calculate variable values
        var vars = {};
        for (let var_id in this.world.vars) {
            vars[var_id] = this.world.vars[var_id].calc(this.world.vars, this.time);
        }

        // 2. Calculate forces on all objects
        var forces = {};
        for (let obj_id in this.world.phyobjs) {
            var obj = this.world.phyobjs[obj_id];
            var total_force = [0, 0];
            for (let ff_id in this.world.ffs) {
                var ff = this.world.ffs[ff_id];
                var force = ff.compute_force(obj, this.time, vars);
                if (force) {
                    total_force[0] += force[0] || 0;
                    total_force[1] += force[1] || 0;
                }
            }
            forces[obj_id] = total_force;
        }

        // 3. Update object velocity & pos based on forces
        for (let obj_id in this.world.phyobjs) {
            var obj = this.world.phyobjs[obj_id];
            var force = forces[obj_id];
            var ax = force[0] / obj.mass.value || 0;
            var ay = force[1] / obj.mass.value || 0;
            // pos
            var dx = obj.velocity.value[0] * dt + 0.5 * ax * dt ** 2;
            var dy = obj.velocity.value[1] * dt + 0.5 * ay * dt ** 2;
            if (dx != NaN && dy != NaN) obj.pos.update([obj.pos.value[0] + dx, obj.pos.value[1] + dy]);
            // velocity
            var dvx = ax * dt;
            var dvy = ay * dt;
            if (dvx != NaN && dvy != NaN) obj.velocity.update([obj.velocity.value[0] + dvx, obj.velocity.value[1] + dvy]);
        }
    }

    _near(now, target, dt) {
        if (now === target) // exact match
            return true;
        if (now < target && now + dt > target) // crossed target from below (四舍)
            return (target - now) < dt / 2;
        if (now > target && now - dt < target) // crossed target from above (五入)
            return (now - target) <= dt / 2;
        return false;
    }

    backup(t = null) {
        this.backups[t || this.time] = this.world.toJSON();
    }

    simulate_to(target_time, dt = null) {
        dt = dt || SETTINGS.dt;

        // find latest backup point
        var backup_times = Object.keys(this.backups).sort();
        var backup_time = Math.max(...backup_times.filter(t => t <= target_time));
        this.restore_backup(backup_time);
        // simulate forward
        var counter = 0;
        while (this.time < target_time) {
            // simulate step
            let step = Math.min(dt, target_time - this.time);
            this.simulate(step);
            // counter
            counter += 1;
            if (counter % SETTINGS.backup_frequency === 0) {
                this.backup();
            }
        }
    }

    restore_backup(time) {
        console.log("Restoring backup for time", time, this.backups);
        if (this.backups[time]) {
            this.world.reset(World.fromJSON(this.backups[time]));
            this.time = time;
        } else {
            throw new Error("No backup found for time " + time);
        }
    }
};

const globalSimulation = new Simulation(globalWorld);

export { Simulation, SETTINGS, globalSimulation };