export declare type Payloadable = {
    [key: string]: any;
};
export declare type Payload = Payloadable | Array<Payloadable> | Promise<Payloadable | Array<Payloadable>>;
export declare function isPromise(param: any): param is Promise<Payloadable>;
export declare function isArray(param: any): param is Array<Payloadable>;
export declare function isPayload(param: any): param is Payload;
