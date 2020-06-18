"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_type_guards_1 = require("ts-type-guards");
function isStageExecutor(param) {
    return ts_type_guards_1.is(Function)(param);
}
exports.isStageExecutor = isStageExecutor;
function isStage(param) {
    return ts_type_guards_1.is(Object)(param) && param.hasOwnProperty('executor');
}
exports.isStage = isStage;
function MakeStage(executor, name, condition, filter) {
    let stg = {
        executor: executor,
        status: 'ready',
        done: false,
        running: false
    };
    if (name) {
        stg.name = name;
    }
    if (condition) {
        stg.condition = condition;
    }
    if (filter) {
        stg.filter = filter;
    }
    return stg;
}
exports.MakeStage = MakeStage;
