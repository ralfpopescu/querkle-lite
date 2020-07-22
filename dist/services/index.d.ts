import sql from 'mssql';
import { Translator } from './db-stringifier';
import { ColumnType, Model } from '../generate-model';
export { query } from './query';
export * as dbStringifier from './db-stringifier';
export declare const inferType: (entity: any, param: any, value: any) => ColumnType;
declare type DetermineTypeOptions = {
    readonly param: string;
    readonly entity: string;
    readonly model: Model;
    readonly value?: any;
};
export declare const determineType: ({ param, value, entity, model, }: DetermineTypeOptions) => ColumnType;
export declare const parseNumber: (value: any, param: string, entity: string, model: Model) => any;
export declare const format: <T>(recordset: sql.IRecordSet<any>, translator: Translator) => readonly T[];
export declare const stringifyGet: ({ entity, where, is, multiple, returnField, }: {
    entity: any;
    where: any;
    is: any;
    multiple: any;
    returnField: any;
}) => string;
export declare const parseGetString: (key: string) => {};
export declare const getParamTypes: (model: Model) => ({ entity, params }: {
    entity: any;
    params: any;
}) => any;
export declare const makeArbitraryString: (value: string) => string;
