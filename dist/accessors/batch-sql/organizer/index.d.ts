import { DeserializedBatchSql } from '../serializer';
import { StringKeys } from '../../index';
declare type ParamConfig<T> = {
    readonly params: Array<any> | null;
    readonly multiple: boolean;
    readonly batchEntity: string;
    readonly batchParam: StringKeys<T>;
    readonly addToBatches: ReadonlyArray<string>;
};
export declare type OrganizedBatchedSqls<T> = {
    readonly [hash: string]: {
        readonly queryString: string;
        readonly parameterize?: boolean;
    } & {
        readonly [paramString: string]: ParamConfig<T>;
    };
};
export declare const organizeBatchedSqls: <T, R>(deserializedBatchedSqls: readonly DeserializedBatchSql<T, R>[]) => OrganizedBatchedSqls<T>;
export {};
