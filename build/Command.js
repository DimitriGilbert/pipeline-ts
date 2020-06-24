"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.ReservedOptions = void 0;
const minimist_1 = __importDefault(require("minimist"));
const _1 = require(".");
const _2 = require(".");
exports.ReservedOptions = [
    "pipeline",
    "pipelineStages"
];
class Command {
    constructor(container, args) {
        this.stages = [];
        this.container = container;
        this.args = {};
        this.payload = {};
        if (args) {
            this.parseArgs(args);
        }
    }
    parseArgs(args) {
        this.args = minimist_1.default(args.slice(2));
        for (let argName in this.args) {
            if (this.args.hasOwnProperty(argName)) {
                if (argName === "_") {
                    if (this.args[argName].length > 0) {
                        this.parseStages(this.args[argName]);
                    }
                }
                else if (exports.ReservedOptions.indexOf(argName) === -1) {
                    this.payload[argName] = this.args[argName];
                }
                else {
                    this.parseReservedOptions(argName, this.args[argName]);
                }
            }
        }
        return this;
    }
    parseReservedOptions(argName, arg) {
        switch (argName) {
            case "pipilineStages":
                if (typeof arg === "string") {
                    this.parseStages(arg);
                }
                break;
            default:
                throw new Error("Unknown option " + argName);
        }
        return this;
    }
    parseStages(stagesStr) {
        let stgs;
        if (typeof stagesStr === "string") {
            stgs = stagesStr.split(",");
        }
        else {
            stgs = stagesStr;
        }
        this.stages = this.stages.concat(stgs.map((stgStr) => {
            return this.container.getInstance(stgStr);
        }));
        return this;
    }
    parsePipeline(pipelineStr) {
        let p = this.container.getInstance(pipelineStr);
        if (_2.isMinimalPipeline(p)) {
            this.pipeline = p;
        }
        return this;
    }
    process() {
        return new Promise((resolve, reject) => {
            if (!this.pipeline) {
                this.pipeline = new _2.Pipeline();
            }
            this.stages.forEach((stage) => {
                var _a;
                (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.pipe(stage);
            });
            let result = this.pipeline.process(this.payload);
            if (_1.isPromise(result)) {
                result.then((res) => {
                    resolve(res);
                }).catch((err) => {
                    reject(err);
                });
            }
            else {
                resolve(result);
            }
        });
    }
}
exports.Command = Command;
