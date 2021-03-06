import { PipelineOptions } from ".";
import { LogEntry } from ".";
import { Stage, StageExecutor, StageFilter } from ".";
import { Payload, Payloadable } from ".";
import { PipelineEventListener } from ".";
export interface PipeablePipelineInterface {
    asStage: () => Stage;
}
export declare type PipeableBase = Stage | PipeablePipelineInterface | StageExecutor;
export declare type Pipeable = PipeableBase | Array<PipeableBase>;
export declare type PipeableCondition = (payload: Payload, parent: ParentPipelineInterface) => boolean;
export declare function isMinimalPipeline(param: any): param is MinimalPipelineInterface;
export declare function isPipeablePipeline(param: any): param is PipeablePipelineInterface;
export declare function isPipes(param: any): param is Array<Pipeable>;
export declare function isPipe(param: any): param is Pipeable;
export declare function isPipeable(param: any): param is Pipeable;
export interface ParentPipelineInterface {
    options: PipelineOptions;
    name: string;
    parent?: ParentPipelineInterface;
    parentIndex?: number;
    log(currentIndex: number, log: LogEntry): void;
    error(currentIndex: number | undefined, message: string, payload: Payloadable, data?: any): void;
    savePayload(payload: Payloadable, path?: string): void;
    readPayload(path: string): Payload;
}
export interface MinimalPipelineInterface extends ParentPipelineInterface, PipeablePipelineInterface {
    running?: boolean;
    interupted?: boolean;
    errors?: Array<any>;
    pipe(stage: Pipeable, at?: number): this;
    process(payload: Payload, start?: number, options?: PipelineOptions): Payload;
}
export interface PipelineHasEvent {
    addEventListener: (name: string, event: PipelineEventListener) => boolean;
    removeEventListener: (name: string, event: PipelineEventListener) => boolean;
    triggerEventListener: (name: string, payload: Payload, index?: number) => Promise<Payload>;
}
export declare function hasEvent(param: any): param is PipelineHasEvent;
export declare class PipelineProperties {
    stages: Array<Stage>;
    stageIndex: number;
    status: string;
    stageConditions: Array<PipeableCondition | undefined>;
    logs: Array<LogEntry>;
    options: PipelineOptions;
    parent?: ParentPipelineInterface;
    parentIndex?: number;
    running?: boolean;
    interupted?: boolean;
    errors?: any[];
    done?: Array<boolean>;
    processReject?: (reason: any) => void;
}
export declare class Pipeline extends PipelineProperties implements MinimalPipelineInterface {
    _name?: string;
    constructor(stages?: Pipeable, options?: PipelineOptions, name?: string);
    get name(): string;
    addEventListener(name: string, event: PipelineEventListener): boolean;
    removeEventListener(name: string, event: PipelineEventListener): boolean;
    triggerHook(name: string, payload: Payload, index?: number): Promise<Payload>;
    triggerEventListener(name: string, payload?: Payload, index?: number): void;
    pipe(stage: Pipeable, at?: number): this;
    addStage(stage: Stage, at?: number): this;
    get currentStage(): Stage;
    progressReport(): {
        name: string;
        status: string;
        length: number;
        index: number;
        progress: number;
        stagesStatus: {
            name: string | undefined;
            status: string | undefined;
        }[];
    };
    runStage(payload: Payload, index?: number): Promise<Payload>;
    completeStage(payload: Payload, status?: string, eventName?: string): void;
    complete(payload: Payload, status?: string, eventName?: string): void;
    output(payload: Payload, status?: string, eventName?: string): Promise<unknown>;
    stageLoop(payload: Payload): Promise<Payload>;
    log(currentIndex: number, log: LogEntry): void;
    error(currentIndex: number, message: string, payload: Payloadable, data?: any): void;
    readPayload(path: string): Payload;
    savePayload(payload: Payloadable, path?: string): void;
    process(payload: Payload, start?: number, options?: PipelineOptions): Promise<Payload>;
    asStage(condition?: PipeableCondition, filter?: StageFilter): Stage;
    asExecutor(payload: Payload, parent?: ParentPipelineInterface, index?: number): Promise<Payload>;
    clone(): any;
    parallel(payloads: Array<Payload>, merger: (toMerge: Array<Payload>, parent: ParentPipelineInterface) => Payload): Promise<Payload>;
}
