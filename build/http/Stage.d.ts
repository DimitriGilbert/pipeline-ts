import { RequestPayload, DownloadPayload } from "./Payload";
import { ParentPipelineInterface } from "../";
export declare function httpRequest(payload: RequestPayload, parent?: ParentPipelineInterface, index?: number): Promise<unknown>;
export declare function download(payload: DownloadPayload, parent?: ParentPipelineInterface, index?: number): Promise<import("..").Payloadable | import("..").Payloadable[] | import("..").Payloadable[]>;
