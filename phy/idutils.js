class IDObject {
    _id = "UNKNOWN";
    set id(newId) {
        if (this._id !== "UNKNOWN") {
            throw new Error("Cannot modify id after initialization");
        }
        this._id = newId;
    }
    get id() {
        return this._id;
    }
}

export { IDObject };