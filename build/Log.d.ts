export declare type LogEntry = {
    level: string;
    message?: string;
    data?: any;
    index?: number;
    [key: string]: any;
};
export declare const LogLevels: Array<string>;
