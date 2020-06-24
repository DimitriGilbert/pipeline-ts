import { Payloadable } from "./Payload";
import { Pipeline } from "./Pipeline";
export declare type PipelineEventListenerData = {
    payload?: Payloadable;
    evtName?: string;
    index?: number;
};
export declare type PipelineEventListener = (pipeline: Pipeline, data: PipelineEventListenerData) => void;
export declare const PipelineEventList: {
    start: string;
    complete: string;
    beforeStage: string;
    afterStage: string;
    error: string;
    log: string;
    pipe: string;
    addStage: string;
};
