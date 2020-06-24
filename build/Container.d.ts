import { Pipeable } from ".";
export declare type Containerable = Pipeable | ContainerPipeableEntry | ContainerContainerEntry | ContainerInstanciableEntry;
export declare type ContainerBaseEntry = {
    name: string;
    expects?: any;
    provides?: any;
    factory?: (() => Pipeable) | boolean;
    pipeable?: Pipeable;
    container?: Container;
};
export declare type ContainerPipeableEntry = {
    pipeable: Pipeable;
} & ContainerBaseEntry;
export declare type ContainerContainerEntry = {
    container: Container;
} & ContainerBaseEntry;
export declare type ContainerInstanciableEntry = {
    factory: () => Pipeable;
} & ContainerBaseEntry;
export declare type ContainerEntry = ContainerPipeableEntry | ContainerContainerEntry;
export declare type ContainerEntries = {
    [key: string]: ContainerEntry;
};
export declare function isContainerPipeableEntry(param: any): param is ContainerPipeableEntry;
export declare function isContainerContainerEntry(param: any): param is ContainerContainerEntry;
export declare function isContainerEntry(param: any): param is ContainerEntry;
export declare function isContainerInstanciableEntry(param: any): param is ContainerInstanciableEntry;
export declare function isContainer(param: any): param is Container;
export declare class Container {
    entries?: ContainerEntries;
    constructor(entries?: ContainerEntries);
    has(name: string, check?: string | Array<string>): boolean;
    set(name: string, content: Pipeable | Container, expects?: any, provides?: any): this;
    get(name: string, check?: string | Array<string>): ContainerEntry;
    getInstance(name: string): Pipeable;
}
