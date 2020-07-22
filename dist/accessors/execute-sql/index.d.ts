import { StringKeys } from '../index';
import { ColumnType } from '../../generate-model';
export declare type Params = {
    readonly [key: string]: string | number;
};
export declare type ParamTypes = {
    readonly [key: string]: ColumnType;
};
export declare type EntityParams<T> = {
    readonly [key in StringKeys<T>]: string | number;
};
export declare type EntityParamTypes<T> = {
    readonly [key in StringKeys<T>]: ColumnType;
};
declare type BaseOptions<T> = {
    readonly queryString: string;
    readonly params?: EntityParams<T>;
    readonly paramTypes?: EntityParamTypes<T>;
};
declare type OptionsSingle<T> = BaseOptions<T> & {
    readonly multiple?: false;
};
declare type OptionsMultiple<T> = BaseOptions<T> & {
    readonly multiple: true;
};
declare type ExecuteSql = {
    <T>(options: OptionsSingle<T>): Promise<T>;
    <T>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
};
export declare const executeSql: ({ pool, translator, }: {
    pool: any;
    translator: any;
}) => ExecuteSql;
export {};
