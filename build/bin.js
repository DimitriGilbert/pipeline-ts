"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CoreContainer_1 = require("./CoreContainer");
const _1 = require(".");
let cli = new _1.Command(CoreContainer_1.CoreContainer);
cli.parseArgs(process.argv);
cli.process();
