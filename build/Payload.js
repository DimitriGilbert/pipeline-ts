"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_type_guards_1 = require("ts-type-guards");
function isPromise(param) {
    return ts_type_guards_1.is(Promise)(param);
}
exports.isPromise = isPromise;
function isArray(param) {
    return ts_type_guards_1.is(Array)(param);
}
exports.isArray = isArray;
function isPayload(param) {
    return isPromise(param) || isArray(param) || (param && typeof param === "object");
}
exports.isPayload = isPayload;
