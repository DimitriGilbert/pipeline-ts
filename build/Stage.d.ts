import { Payload, Payloadable } from ".";
import { ParentPipelineInterface, PipeableCondition } from ".";
export declare function isStageExecutor(param: any): param is StageExecutor & StageBase;
export declare function isStage(param: any): param is Stage;
export declare type StageBase = (payload: Payload, parent?: ParentPipelineInterface, index?: number) => Payload;
export declare type StageExecutor = (payload: Payloadable, parent?: ParentPipelineInterface, index?: number) => Payload;
export declare type StageFilter = {
    in?: (payload: Payloadable) => Payloadable;
    out?: (unfilteredPayload: Payloadable, nestPayload: Payloadable) => Payloadable;
};
export declare type Stage = {
    executor: StageExecutor;
    status?: string;
    done: boolean;
    running: boolean;
    name?: string;
    condition?: PipeableCondition;
    filter?: StageFilter;
    [key: string]: any;
};
export declare function MakeStage(executor: StageExecutor, name?: string, condition?: PipeableCondition, filter?: StageFilter): Stage;
