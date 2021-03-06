import { Container } from ".";
import { Payloadable } from ".";
import { Pipeable, Pipeline } from ".";
import { PipelineEventListenerData } from "./Event";
export declare const ReservedOptions: string[];
export declare class Command {
    container: Container;
    args: Payloadable;
    payload: Payloadable;
    stages: Array<Pipeable>;
    pipeline?: Pipeline;
    constructor(container: Container, args?: Array<string>);
    parseArgs(args: Array<string>): this;
    parseReservedOptions(argName: string, arg: string | boolean | number): this;
    parseStages(stagesStr: string | Array<string>): this;
    parsePipeline(pipelineStr: string): this;
    process(): Promise<unknown>;
    reportProgress(d: PipelineEventListenerData): void;
}
