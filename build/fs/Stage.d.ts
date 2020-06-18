import { ParentPipelineInterface } from "../Pipeline";
import { readPayload, FsPayload, writePayload, mkdirPayload, copyPayload } from "./Payload";
export declare function PathExists(payload: FsPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function ReadFile(payload: readPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function WriteFile(payload: writePayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function Copy(payload: copyPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function BakFile(payload: copyPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function MkDir(payload: mkdirPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
