"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreContainer = exports.HttpConstainer = exports.FsConstainer = void 0;
const Container_1 = require("./Container");
const _1 = require(".");
exports.FsConstainer = (new Container_1.Container())
    // @ts-ignore
    .set('PathExists', _1.Fs.PathExists)
    // @ts-ignore
    .set('ReadFile', _1.Fs.ReadFile)
    // @ts-ignore
    .set('WriteFile', _1.Fs.WriteFile)
    // @ts-ignore
    .set('Copy', _1.Fs.Copy)
    // @ts-ignore
    .set('BakFile', _1.Fs.BakFile)
    // @ts-ignore
    .set('MkDir', _1.Fs.MkDir);
exports.HttpConstainer = (new Container_1.Container())
    // @ts-ignore
    .set('HttpRequest', _1.Http.httpRequest)
    // @ts-ignore
    .set('Download', _1.Http.download);
exports.CoreContainer = (new Container_1.Container())
    .set('Fs', exports.FsConstainer)
    .set('Http', exports.HttpConstainer);
