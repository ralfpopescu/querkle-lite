import { SerializedBatchSql } from './serializer';
import { Dependencies, Transform, TransformMultiple } from '../index';
import DataLoader from 'dataloader';
export declare type BatchIdentifier = string | number;
declare type BaseOptions<T> = {
    readonly queryString: string;
    readonly parameterize?: boolean;
    readonly addToBatch?: BatchIdentifier;
    readonly batchEntity?: string;
    readonly batchParam?: keyof T;
    readonly params?: Array<any>;
};
declare type OptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type OptionsSingleTransform<T, R, F extends Transform<T, R>> = BaseOptions<T> & {
    readonly multiple?: false;
    readonly transform: F;
};
declare type OptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type OptionsMultipleTransform<T, R, F extends Transform<T, R>> = BaseOptions<T> & {
    readonly multiple: true;
    readonly transform: F;
};
declare type OptionsMultipleTransformMultiple<T, R, F extends TransformMultiple<T, R>> = BaseOptions<T> & {
    readonly multiple: true;
    readonly transformMultiple: F;
};
export declare type BatchSql = {
    <T = any, R = never, F = never>(options: OptionsSingle<T>): Promise<T>;
    <T = any, R = any, F extends Transform<T, R> = Transform<T, R>>(options: OptionsSingleTransform<T, R, F>): Promise<R>;
    <T = any, R = never, F = never>(options: OptionsMultiple<T>): Promise<Array<T>>;
    <T = any, R = any, F extends Transform<T, R> = Transform<T, R>>(options: OptionsMultipleTransform<T, R, F>): Promise<Array<R>>;
    <T = any, R = any, F extends TransformMultiple<T, R> = TransformMultiple<T, R>>(options: OptionsMultipleTransformMultiple<T, R, F>): Promise<R>;
};
export declare const batchSqlFunction: <T, R>(dependencies: Dependencies) => (batchedSqls: SerializedBatchSql<T, R>[]) => Promise<any[]>;
export declare const batchSql: <T = any, R = any, F = any>(batchDataLoader: DataLoader<SerializedBatchSql<T, R>, any, SerializedBatchSql<T, R>>) => BatchSql;
export {};
