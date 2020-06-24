/// <reference types="node" />
import { Payloadable } from "..";
export declare type FsPayload = {
    path: string;
} & Payloadable;
export declare type readPayload = {
    asBuffer?: boolean;
    sanitize?: (data: string | Buffer) => string | Buffer;
} & FsPayload;
export declare type copyPayload = {
    to: string;
    force?: boolean;
    bak?: boolean | string;
} & FsPayload;
export declare type writePayload = {
    sanitizeTo?: (data: string | Buffer) => string | Buffer;
    data: string | Buffer;
} & copyPayload;
export declare type operationPayload = {
    type: string;
} & FsPayload;
export declare type writeOperationPayload = {
    length: number;
} & operationPayload;
export declare type mkdirPayload = {
    noRecursive?: boolean;
} & FsPayload;
