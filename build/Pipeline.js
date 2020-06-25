"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = exports.PipelineProperties = exports.hasEvent = exports.isPipeable = exports.isPipe = exports.isPipes = exports.isPipeablePipeline = exports.isMinimalPipeline = void 0;
const ts_type_guards_1 = require("ts-type-guards");
const _1 = require(".");
const _2 = require(".");
const Stage_1 = require("./fs/Stage");
function isMinimalPipeline(param) {
    return ts_type_guards_1.is(Object)(param) && ts_type_guards_1.is(Function)(param.pipe) && ts_type_guards_1.is(Function)(param.process);
}
exports.isMinimalPipeline = isMinimalPipeline;
function isPipeablePipeline(param) {
    return ts_type_guards_1.is(Object)(param) && ts_type_guards_1.is(Function)(param.asStage);
}
exports.isPipeablePipeline = isPipeablePipeline;
function isPipes(param) {
    return ts_type_guards_1.isArrayOf(Object)(param) || ts_type_guards_1.isArrayOf(Function)(param);
}
exports.isPipes = isPipes;
function isPipe(param) {
    return ts_type_guards_1.is(Function)(param) || isPipeablePipeline(param);
}
exports.isPipe = isPipe;
function isPipeable(param) {
    return param && (typeof param === "function" || (typeof param === "object"
        && param.stage
        && typeof param.stage === "function"));
}
exports.isPipeable = isPipeable;
function hasEvent(param) {
    return param
        && typeof param.addEventListener === "function"
        && typeof param.removeEventListener === "function"
        && typeof param.triggerEventListener === "function";
}
exports.hasEvent = hasEvent;
class PipelineProperties {
    constructor() {
        this.stages = [];
        this.stageIndex = 0;
        this.status = 'empty';
        this.stageConditions = [];
        this.logs = [];
        this.options = {};
        this.done = [];
    }
}
exports.PipelineProperties = PipelineProperties;
class Pipeline extends PipelineProperties {
    constructor(stages, options = {}, name) {
        super();
        if (stages) {
            this.pipe(stages);
        }
        this.options = options;
        if (name) {
            this._name = name;
        }
        this.running = false;
    }
    get name() {
        if (this._name) {
            return this._name;
        }
        let name = Object.getPrototypeOf(this).constructor.name;
        if (this.parent) {
            name += '_' + this.parent.name;
        }
        return name;
    }
    addEventListener(name, event) {
        // if (name in PipelineEventList) {
        if (!this.options.eventListeners) {
            this.options.eventListeners = {};
        }
        // @ts-ignore
        if (!this.options.eventListeners[name]) {
            // @ts-ignore
            this.options.eventListeners[name] = [];
        }
        // @ts-ignore
        if (!ts_type_guards_1.is(Array)(this.options.eventListeners[name])) {
            // @ts-ignore
            this.options.eventListeners[name] = [this.options.eventListeners[name]];
        }
        this.log(-1, {
            level: 'vv',
            message: `Adding listeners to event ${name}`,
            data: event
        });
        // @ts-ignore
        this.options.eventListeners[name].push(event);
        return true;
        // }
        return false;
    }
    removeEventListener(name, event) {
        if (!this.options.eventListeners) {
            return true;
        }
        // @ts-ignore
        if (!this.options.eventListeners[name]) {
            return true;
        }
        // @ts-ignore
        if (!ts_type_guards_1.is(Array)(this.options.eventListeners[name])) {
            // @ts-ignore
            this.options.eventListeners[name] = [this.options.eventListeners[name]];
        }
        // @ts-ignore
        let index = this.options.eventListeners[name].indexOf(event);
        if (index !== -1) {
            this.log(-1, {
                level: 'vv',
                message: `Removing listeners to event ${name}`,
                data: event
            });
            // @ts-ignore
            this.options.eventListeners[name] = [].concat(
            // @ts-ignore
            this.options.eventListeners[name].slice(0, index), 
            // @ts-ignore
            this.options.eventListeners[name].slice(index + 1));
            return true;
        }
        return false;
    }
    triggerHook(name, payload, index) {
        return new Promise((resolve, reject) => {
            if (!this.options.hooks ||
                (this.options.hooks && !this.options.hooks[name])) {
                this.log(-1, {
                    level: 'vv',
                    message: `No Hook ${name}`
                });
                resolve(payload);
            }
            else {
                this.log(-1, {
                    level: 'vv',
                    message: `Hook ${name}`,
                    data: this.options.hooks[name]
                });
                let hookPipeline = new Pipeline(this.options.hooks[name].pipeable, this.options.hooks[name].options);
                hookPipeline.parent = this;
                hookPipeline.parentIndex = 999999998;
                hookPipeline.process(payload).catch((err) => {
                    this.error(index ? index : 999999997, 'hook error', err);
                    reject(err);
                }).then((hookPayload) => {
                    this.log(-1, {
                        level: 'vv',
                        message: `Hook ${name} Complete`
                    });
                    // @ts-ignore
                    resolve(hookPayload);
                });
            }
        });
    }
    triggerEventListener(name, payload, index) {
        this.log(index ? index : -1, {
            level: 'vvv',
            message: `Event ${name}`,
            data: payload
        });
        let d = {};
        if (payload !== undefined) {
            d.payload = payload;
        }
        if (index !== undefined) {
            d.index = index;
        }
        if (
        // name in PipelineEventList
        this.options.eventListeners
            // meeeehhhh
            // @ts-ignore
            && this.options.eventListeners[name]) {
            // @ts-ignore
            if (ts_type_guards_1.is(Array)(this.options.eventListeners[name])) {
                this.log(index ? index : -1, {
                    level: 'vv',
                    message: `Event ${name} has ${this.options.eventListeners[name].length} listeners`,
                    data: payload
                });
                // @ts-ignore
                this.options.eventListeners[name].forEach((evt) => {
                    evt(this, d);
                });
            }
            else {
                this.log(index ? index : -1, {
                    level: 'vv',
                    message: `Event ${name} has 1 listener`,
                    data: payload
                });
                // @ts-ignore
                this.options.eventListeners[name](this, d);
            }
        }
        if (hasEvent(this.parent)) {
            this.parent.triggerEventListener(`stage_${name}`, d, this.parentIndex);
        }
    }
    pipe(stage, at) {
        this.triggerEventListener('pipe', { stage: stage });
        if (isPipes(stage)) {
            stage.forEach((s) => {
                this.pipe(s, at);
                if (at !== undefined) {
                    at++;
                }
            });
        }
        if (isPipeablePipeline(stage)) {
            stage = stage.asStage();
        }
        if (_1.isStage(stage)) {
            this.addStage(stage, at);
        }
        if (_1.isStageExecutor(stage)) {
            this.addStage({
                executor: stage,
                done: false,
                running: false
            }, at);
        }
        return this;
    }
    addStage(stage, at) {
        if (at === undefined) {
            this.stages.push(stage);
        }
        else {
            let stages = this.stages;
            this.stages = stages.slice(0, at);
            this.stages.push(stage);
            this.stages.concat(stages.slice(at));
        }
        if (this.status === 'empty') {
            this.status = 'staged';
        }
        if (!stage.status) {
            stage.status = 'ready';
        }
        this.triggerEventListener('addStage', { stage: stage });
        return this;
    }
    runStage(payload, index) {
        return new Promise((resolve, reject) => {
            if (index === undefined) {
                index = this.stageIndex;
            }
            if (!_2.isPromise(payload)) {
                this.stages[index].status = 'running';
                this.stages[index].running = true;
                this.triggerEventListener('beforeStage', payload, index);
                let stagePayload = payload;
                let stage = this.stages[index];
                if (stage.filter && stage.filter.in) {
                    stagePayload = stage.filter.in(payload);
                }
                let nextload = stage.executor(stagePayload, this, index);
                resolve(nextload);
            }
            else {
                let i = index;
                payload.then((stageLoad) => {
                    let nextLoad = this.runStage(stageLoad, i);
                    resolve(nextLoad);
                }).catch((err) => {
                    this.error(i, 'previous stage error', err);
                    reject(err);
                });
            }
        });
    }
    completeStage(payload, status = 'done', eventName = 'afterStage') {
        this.stages[this.stageIndex].status = status;
        this.stages[this.stageIndex].running = false;
        this.stages[this.stageIndex].done = true;
        this.triggerEventListener(eventName, payload, this.stageIndex);
        this.stageIndex++;
    }
    complete(payload, status = 'done', eventName = 'done') {
        this.running = false;
        this.status = status;
        this.triggerEventListener(eventName, payload, this.stageIndex);
    }
    output(payload, status = 'completed', eventName = 'completed') {
        return new Promise((resolve, reject) => {
            this.triggerHook('output', payload).then((outputLoad) => {
                var _a, _b;
                if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.save) {
                    let path;
                    if (typeof this.options.output.save === "string") {
                        path = this.options.output.save;
                    }
                    this.savePayload(outputLoad, path);
                }
                this.status = status;
                this.triggerEventListener(eventName, outputLoad, this.stageIndex);
                resolve(outputLoad);
            }).catch((err) => {
                this.error(this.stageIndex, 'output hook error', err);
            });
        });
    }
    stageLoop(payload) {
        return new Promise((resolve, reject) => {
            if (this.running && this.stages[this.stageIndex].status === 'ready') {
                this.triggerEventListener('readyStage', payload, this.stageIndex);
                let skip = false;
                let stg = this.stages[this.stageIndex];
                if (stg.condition) {
                    skip = !stg.condition(payload, this);
                }
                if (!skip) {
                    this.runStage(payload)
                        .then((nextLoad) => {
                        let completeLoad = nextLoad;
                        if (stg.filter && stg.filter.out) {
                            completeLoad = stg.filter.out(nextLoad, payload);
                        }
                        this.completeStage(completeLoad);
                        if (this.stageIndex >= this.stages.length) {
                            this.complete(completeLoad);
                            resolve(this.output(completeLoad));
                        }
                        else {
                            resolve(this.stageLoop(completeLoad));
                        }
                    })
                        .catch((err) => {
                        this.error(this.stageIndex, 'stage error', err);
                        reject(err);
                    });
                }
                else {
                    this.completeStage(payload, 'skiped', 'stageSkiped');
                }
            }
        });
    }
    log(currentIndex, log) {
        var _a, _b;
        if ((_a = this.options.log) === null || _a === void 0 ? void 0 : _a.keep) {
            log.index = currentIndex;
            this.logs.push(log);
        }
        // this.triggerEventListener('log', log, currentIndex)
        (_b = this.parent) === null || _b === void 0 ? void 0 : _b.log(this.parentIndex ? this.parentIndex : 0, {
            level: log.level,
            message: log.message,
            data: {
                index: currentIndex,
                data: log.data
            }
        });
    }
    error(currentIndex, message, payload, data) {
        var _a;
        this.interupted = true;
        this.running = false;
        this.logs.push({
            level: "error",
            index: currentIndex,
            message: message,
            data: data
        });
        this.triggerEventListener('error', payload, currentIndex);
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.error(this.parentIndex ? this.parentIndex : 0, message, payload, {
            index: currentIndex,
            piepline: Object.getPrototypeOf(this),
            data: data
        });
    }
    readPayload(path) {
        let s = [
            Stage_1.ReadFile,
            (payload, parent) => {
                try {
                    this.triggerEventListener('readPayload', payload);
                    // @ts-ignore
                    return JSON.parse(payload.data);
                }
                catch (err) {
                    this.error(999999999, 'Can not parse payload', {
                        path: path,
                        error: err
                    });
                }
            }
        ];
        // @ts-ignore
        return new Pipeline(s).process({
            path: path
        });
    }
    savePayload(payload, path) {
        if (!path) {
            path = `${this.name}_${Date.now()}_payload.json`;
        }
        let d = {
            to: path,
            data: JSON.stringify(payload, null, 2),
            path: path
        };
        Stage_1.WriteFile(d, this).catch((err) => { }).then((data) => {
            this.triggerEventListener('savedPayload', payload);
        });
    }
    process(payload, start = 0, options) {
        return new Promise((resolve, reject) => {
            this.running = true;
            this.status = 'running';
            if (options) {
                this.options = options;
            }
            this.triggerEventListener('start', payload, start);
            this.triggerHook('filter', payload, -1).then((filteredLoad) => {
                this.triggerEventListener('filtered', filteredLoad, start);
                this.stageIndex = start;
                this.stageLoop(filteredLoad).then((processedLoad) => {
                    resolve(processedLoad);
                }).catch((err) => {
                    console.log(err);
                });
            }).catch((err) => {
                console.log(err);
            });
        });
    }
    asStage(condition, filter) {
        this.triggerEventListener('asStage');
        return _1.MakeStage((payload, parent, index) => {
            return this.asExecutor(payload, parent, index);
        }, this.name, condition, filter);
    }
    asExecutor(payload, parent, index) {
        this.triggerEventListener('asExecutor');
        if (parent) {
            this.parent = parent;
        }
        if (index) {
            this.parentIndex = index;
        }
        return this.process(payload);
    }
    clone() {
        this.triggerEventListener('clone');
        return new (Object.getPrototypeOf(this).constructor)(this.stages, this.options);
    }
    parallel(payloads, merger) {
        return new Promise((resolve, reject) => {
            this.triggerEventListener('parrallel', payloads);
            let outputs = [];
            let done = [];
            let pipelines = [];
            for (let pipelineIndex = 0; pipelineIndex < payloads.length; pipelineIndex++) {
                let payload = payloads[pipelineIndex];
                pipelines.push(this.clone());
                done.push(false);
                pipelines[pipelineIndex].parent = this;
                pipelines[pipelineIndex].process(payload).catch((err) => {
                    this.error(pipelineIndex, 'parallel error', err);
                })
                    // @ts-ignore
                    .then((newload) => {
                    outputs[pipelineIndex] = newload;
                    done[pipelineIndex] = true;
                    this.triggerEventListener('parrallelPartComplete', outputs[pipelineIndex], pipelineIndex);
                    let complete = (done.indexOf(false) === -1);
                    if (complete) {
                        let out_ = merger(outputs, this);
                        resolve(out_);
                        this.triggerEventListener('parrallelComplete', out_);
                    }
                });
            }
        });
    }
}
exports.Pipeline = Pipeline;
