import { Payload } from "./Payload";
import { ParentPipelineInterface, PipeableCondition } from "./Pipeline";
export declare function isStageExecutor(param: any): param is StageExecutor & StageBase;
export declare function isStage(param: any): param is Stage;
export declare type StageBase = (payload: Payload, parent?: ParentPipelineInterface, index?: number) => Payload;
export declare type StageExecutor = (payload: Payload, parent?: ParentPipelineInterface, index?: number) => Payload;
export declare type Stage = {
    executor: StageExecutor;
    status?: string;
    done: boolean;
    running: boolean;
    name?: string;
    condition?: PipeableCondition;
    [key: string]: any;
};
export declare function isBetterStage(param: any): param is Stage;
