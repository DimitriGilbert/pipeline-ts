"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const Pipeline_1 = require("../Pipeline");
const Stage_1 = require("../fs/Stage");
function httpRequest(payload, parent, index) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (!payload.request.method) {
                payload.request.method = 'get';
            }
            axios_1.default.request(payload.request).then((res) => {
                payload.response = res;
                resolve(res);
            }).catch((err) => {
                reject(err);
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'http error', payload, err);
            });
        });
    });
}
exports.httpRequest = httpRequest;
function download(payload, parent, index) {
    return __awaiter(this, void 0, void 0, function* () {
        function resp2data(pl) {
            var _a;
            payload.data = (_a = payload.response) === null || _a === void 0 ? void 0 : _a.data;
            return payload;
        }
        let stages = [
            httpRequest,
            resp2data,
            Stage_1.WriteFile
        ];
        let p = new Pipeline_1.Pipeline();
        // @ts-ignore
        p.pipe(stages);
        return p.asExecutor(payload, parent, index);
    });
}
exports.download = download;
