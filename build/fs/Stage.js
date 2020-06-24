"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MkDir = exports.BakFile = exports.Copy = exports.WriteFile = exports.ReadFile = exports.PathExists = void 0;
const fs = __importStar(require("fs"));
function PathExists(payload, parent, index) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (payload.path) {
                fs.access(payload.path, (err) => {
                    if (err) {
                        reject(err);
                        parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs access error', payload, err);
                    }
                    else {
                        resolve(payload);
                    }
                });
            }
            else {
                let err = { needInput: "path" };
                reject(err);
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'path missing', payload, err);
            }
        });
    });
}
exports.PathExists = PathExists;
function ReadFile(payload, parent, index) {
    return new Promise((resolve, reject) => {
        fs.readFile(payload.path, (err, data) => {
            if (err) {
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs read error', payload, err);
                reject(err);
            }
            else {
                let output = data;
                if (payload.asBuffer !== true) {
                    output = output.toString();
                }
                if (payload.sanitize) {
                    output = payload.sanitize(output);
                }
                resolve(Object.assign(payload, { data: output }));
            }
        });
    });
}
exports.ReadFile = ReadFile;
function WriteFile(payload, parent, index) {
    return new Promise((resolve, reject) => {
        let output = {
            type: "write",
            length: payload.data.length,
            path: payload.to,
            data: payload.data
        };
        if (payload.sanitizeTo) {
            // @ts-ignore
            output.data = payload.sanitizeTo(output.data);
        }
        fs.writeFile(payload.to, output.data, (err) => {
            if (err) {
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs write error', payload, err);
                reject(err);
            }
            else {
                resolve(Object.assign(payload, { data: output }));
            }
        });
    });
}
exports.WriteFile = WriteFile;
function Copy(payload, parent, index) {
    return new Promise((resolve, reject) => {
        fs.copyFile(payload.path, payload.to, (err) => {
            if (err) {
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs copy error', payload, err);
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
}
exports.Copy = Copy;
function BakFile(payload, parent, index) {
    return new Promise((resolve, reject) => {
        let bak = payload.bak;
        if (!bak || bak === true) {
            bak = ".bak";
        }
        fs.copyFile(payload.path, payload.path + bak, (err) => {
            if (err) {
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs Bak error', payload, err);
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
}
exports.BakFile = BakFile;
function MkDir(payload, parent, index) {
    return new Promise((resolve, reject) => {
        let r = true;
        if (payload.noRecursive) {
            r = false;
        }
        fs.mkdir(payload.path, {
            recursive: r
        }, (err) => {
            if (err) {
                parent === null || parent === void 0 ? void 0 : parent.error(index, 'fs mkdir error', payload, err);
                reject(err);
            }
            else {
                resolve(payload);
            }
        });
    });
}
exports.MkDir = MkDir;
