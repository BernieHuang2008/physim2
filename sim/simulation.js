class Simulation {
    backups = {};

    constructor(world) {
        this.world = world;
        // initial backup
        this.backups[0] = this.world.toJSON();
        // console.log(this.backups[0]);
    }
}

export { Simulation };