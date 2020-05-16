import { ParentPipelineInterface } from "../Pipeline";
import { readPayload, FsPayload, writePayload, mkdirPayload } from "./Payload";
export declare function PathExists(payload: FsPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function ReadFile(payload: readPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function WriteFile(payload: writePayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function MkDir(payload: mkdirPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
