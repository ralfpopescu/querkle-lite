import { IsValue } from '../../../index';
export declare type SerializedGet = {
    readonly serialization: string;
    readonly entity: string;
    readonly where: string;
    readonly is: IsValue;
    readonly multiple: boolean;
    readonly returnField: string;
    readonly transform: Function;
    readonly transformMultiple: Function;
};
declare type DeserializedGet = {
    readonly entity: string;
    readonly where: string;
    readonly is: IsValue;
    readonly multiple: boolean;
    readonly returnField: string;
    readonly transform?: Function;
    readonly transformMultiple?: Function;
};
export declare const serializeGet: ({ entity, where, is, multiple, returnField, transform, transformMultiple, }: DeserializedGet) => SerializedGet;
export declare const deserializeGet: (serializedGet: SerializedGet) => SerializedGet;
export {};
