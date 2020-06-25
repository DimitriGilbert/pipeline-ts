"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = exports.ReservedOptions = void 0;
const minimist_1 = __importDefault(require("minimist"));
const _1 = require(".");
const _2 = require(".");
const _3 = require(".");
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
            case "pipelineStages":
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
        if (_3.isMinimalPipeline(p)) {
            // @ts-ignore
            this.pipeline = p;
        }
        return this;
    }
    process() {
        return new Promise((resolve, reject) => {
            if (!this.pipeline) {
                this.pipeline = new _3.Pipeline();
            }
            if (_1.hasEvent(this.pipeline)) {
                this.pipeline.addEventListener('error', (ppl, data) => {
                    console.error(ppl, data);
                });
                this.pipeline.addEventListener('done', (ppl, data) => {
                    this.reportProgress({ payload: data });
                });
                this.pipeline.addEventListener('stage_start', (ppl, data) => {
                    this.reportProgress(data);
                });
                this.pipeline.addEventListener('stage_beforeStage', (ppl, data) => {
                    this.reportProgress(data);
                });
                this.pipeline.addEventListener('stage_afterStage', (ppl, data) => {
                    this.reportProgress(data);
                });
                this.pipeline.addEventListener('stage_stageSkiped', (ppl, data) => {
                    this.reportProgress(data);
                });
                this.pipeline.addEventListener('stage_done', (ppl, data) => {
                    this.reportProgress(data);
                });
                this.pipeline.addEventListener('stage_completed', (ppl, data) => {
                    this.reportProgress(data);
                });
            }
            this.stages.forEach((stage) => {
                var _a;
                (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.pipe(stage);
            });
            let result = this.pipeline.process(this.payload);
            if (_2.isPromise(result)) {
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
    reportProgress(d) {
        var _a;
        let report = (_a = this.pipeline) === null || _a === void 0 ? void 0 : _a.progressReport();
        let out = "Starting...";
        if (report) {
            out = `Command ${report.name}: ${report.status} ${report.status === "running" ? `${report.progress}% complete` : ""}`;
            if (report.status === "running"
                && d.payload
                && d.payload.payload
                && d.payload.payload.pipeline) {
                let pReport = d.payload.payload.pipeline.progressReport();
                out += `\n\t${pReport.name}: ${pReport.status} ${pReport.status === "running" ? `${pReport.progress}% complete` : ""}`;
                if (d.payload.payload.pipeline.currentStage) {
                    out += `\n\t\t${d.payload.payload.pipeline.currentStage.name} -> ${d.payload.payload.pipeline.currentStage.status}`;
                }
            }
            else if (report.status === "done") {
                report.stagesStatus.forEach((stageStatus, index) => {
                    out += `\n\t${stageStatus.name} ${index + 1}/${report === null || report === void 0 ? void 0 : report.length} -> ${stageStatus.status}`;
                });
            }
        }
        console.clear();
        console.log(out);
    }
}
exports.Command = Command;
