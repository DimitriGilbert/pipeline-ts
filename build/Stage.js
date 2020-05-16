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
function isBetterStage(param) {
    return ts_type_guards_1.is(Object)(param)
        && param.executor !== undefined
        && ts_type_guards_1.is(Function)(param.executor);
}
exports.isBetterStage = isBetterStage;
