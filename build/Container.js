"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.isContainer = exports.isContainerInstanciableEntry = exports.isContainerEntry = exports.isContainerContainerEntry = exports.isContainerPipeableEntry = void 0;
const _1 = require(".");
function isContainerPipeableEntry(param) {
    return param && param.hasOwnProperty('name') && param.hasOwnProperty('pipeable');
}
exports.isContainerPipeableEntry = isContainerPipeableEntry;
function isContainerContainerEntry(param) {
    return param && param.hasOwnProperty('name')
        && param.hasOwnProperty('container')
        && isContainer(param.container);
}
exports.isContainerContainerEntry = isContainerContainerEntry;
function isContainerEntry(param) {
    return isContainerPipeableEntry(param) || isContainerContainerEntry(param);
}
exports.isContainerEntry = isContainerEntry;
function isContainerInstanciableEntry(param) {
    return isContainerEntry(param)
        && param.hasOwnProperty('factory')
        && (typeof param.factory === "function" || typeof param.factory === "boolean");
}
exports.isContainerInstanciableEntry = isContainerInstanciableEntry;
function isContainer(param) {
    return param
        // && param.hasOwnProperty('entries')
        && typeof param.has === "function"
        && typeof param.get === "function"
        && typeof param.set === "function";
}
exports.isContainer = isContainer;
class Container {
    constructor(entries) {
        if (entries) {
            this.entries = entries;
        }
    }
    has(name, check) {
        var _a;
        let fqn = name.split(".");
        if (fqn.length >= 1) {
            let entryName = fqn[0];
            if ((_a = this.entries) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(entryName)) {
                if (fqn.length > 1) {
                    let entry = this.entries[entryName];
                    if (!isContainerContainerEntry(entry)) {
                        return false;
                    }
                    return entry.container.has(fqn.slice(1).join("."), check);
                }
                if (typeof check === "string") {
                    check = [check];
                }
                let ret = true;
                if (check) {
                    if (ret && check.indexOf("container") !== -1) {
                        ret = isContainerContainerEntry(this.entries[entryName]);
                    }
                    if (ret && check.indexOf("pipeable") !== -1) {
                        ret = isContainerPipeableEntry(this.entries[entryName]);
                    }
                    if (ret && check.indexOf("instantiable") !== -1) {
                        ret = isContainerInstanciableEntry(this.entries[entryName]);
                    }
                }
                return ret;
            }
        }
        return false;
    }
    set(name, content, expects, provides) {
        let fqn = name.split(".");
        if (fqn.length >= 1) {
            if (!this.entries) {
                this.entries = {};
            }
            let entryName = fqn[0];
            if (this.entries.hasOwnProperty(entryName)) {
                if (fqn.length > 1) {
                    let entry = this.entries[entryName];
                    if (isContainerContainerEntry(entry)) {
                        try {
                            return this.set(entryName, entry.container.set(fqn.slice(1).join("."), content, expects, provides));
                        }
                        catch (err) {
                            throw new Error(entryName + "." + err.message);
                        }
                    }
                    throw new Error(entryName + " is not a container, cannot reach " + name);
                }
            }
            let nEntry = {
                name: entryName
            };
            if (_1.isPipeable(content)) {
                nEntry.pipeable = content;
            }
            else if (isContainer(content)) {
                nEntry.container = content;
            }
            if (expects) {
                nEntry.expects = expects;
            }
            if (provides) {
                nEntry.provides = provides;
            }
            if (isContainerEntry(nEntry)) {
                this.entries[entryName] = nEntry;
            }
            return this;
        }
        throw new Error(name + " is not a valid path ");
    }
    get(name, check) {
        var _a;
        if (this.has(name, check)) {
            let fqn = name.split(".");
            if (fqn.length >= 1) {
                let entryName = fqn[0];
                if ((_a = this.entries) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(entryName)) {
                    if (fqn.length > 1) {
                        let entry = this.entries[entryName];
                        if (isContainerContainerEntry(entry)) {
                            try {
                                return entry.container.get(fqn.slice(1).join("."));
                            }
                            catch (err) {
                                throw new Error(entryName + "." + err.message);
                            }
                        }
                        throw new Error(entryName + " is not a container, cannot reach " + name);
                    }
                    return this.entries[entryName];
                }
            }
        }
        throw new Error("Unknown Entry " + name);
    }
    getInstance(name) {
        if (this.has(name)) {
            let pipeOrInstanciable = this.get(name);
            if (isContainerInstanciableEntry(pipeOrInstanciable)) {
                return pipeOrInstanciable.factory();
            }
            else if (isContainerPipeableEntry(pipeOrInstanciable)) {
                return pipeOrInstanciable.pipeable;
            }
        }
        throw new Error(name + " is neither instanciable nor a pipepable");
    }
}
exports.Container = Container;
