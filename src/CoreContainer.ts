import { Container } from "./Container";
import { Fs, Http } from ".";

export const FsConstainer = (new Container())
  // @ts-ignore
  .set('PathExists', Fs.PathExists)
  // @ts-ignore
  .set('ReadFile', Fs.ReadFile)
  // @ts-ignore
  .set('WriteFile', Fs.WriteFile)
  // @ts-ignore
  .set('Copy', Fs.Copy)
  // @ts-ignore
  .set('BakFile', Fs.BakFile)
  // @ts-ignore
  .set('MkDir', Fs.MkDir)

export const HttpConstainer = (new Container())
  // @ts-ignore
  .set('HttpRequest', Http.httpRequest)
  // @ts-ignore
  .set('Download', Http.download)

export const CoreContainer = (new Container())
  .set('Fs', FsConstainer)
  .set('Http', HttpConstainer)
