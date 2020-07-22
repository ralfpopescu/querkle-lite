import { BatchLoadFn } from 'dataloader';
import { PreparedResult } from '../prepare-results';
import { Dependencies, IsValue, StringKeys } from '../../../index';
import { SerializedGet } from '../serializer';
declare type KeyValues<T> = {
    readonly key: StringKeys<T>;
    readonly values: ReadonlyArray<IsValue>;
};
export declare type GetByEntity<T> = {
    readonly entity: string;
    readonly keyValues: ReadonlyArray<KeyValues<T>>;
};
export declare const getBatchFunction: (dependencies: Dependencies) => BatchLoadFn<SerializedGet, PreparedResult>;
export {};
