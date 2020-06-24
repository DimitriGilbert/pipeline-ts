import { LogLevels } from ".";
import { PipelineEventListener } from ".";
import { Payload } from ".";
import { Pipeable } from ".";
export declare type LogOptions = {
    keep?: boolean;
    level?: typeof LogLevels[number];
    saveFile?: string;
};
export declare type parallelOptions = {
    on?: string;
    with?: string | Array<string>;
};
export declare type payloadCleanerFunc = (payload: Payload) => Payload;
export declare type payloadCleaner = string | payloadCleanerFunc;
export declare type outputOptions = {
    wrapper?: string;
    clean?: payloadCleaner | Array<payloadCleaner>;
    save?: string | boolean;
};
export declare type hookOptions = {
    pipeable: Pipeable;
    options?: PipelineOptions;
};
export declare type PipelineEventListenerOptions = {
    [key: string]: PipelineEventListener | Array<PipelineEventListener>;
};
export declare type PipelineOptions = {
    log?: LogOptions;
    parallel?: parallelOptions | boolean;
    failOnInterruption?: boolean;
    eventListeners?: PipelineEventListenerOptions;
    output?: outputOptions;
    hooks?: {
        [key: string]: hookOptions;
    };
};
