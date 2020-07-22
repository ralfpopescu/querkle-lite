import { ConnectionPool, ISqlType } from 'mssql';
import { Translator } from '../services/db-stringifier';
export declare type ColumnType = (() => ISqlType) | ISqlType;
interface Column {
    type: ColumnType;
    nullable: boolean;
    typeName: string;
    columnDefault?: string | number | null;
}
declare type Table = {
    [column: string]: Column;
};
export declare type Model = {
    [table: string]: Table;
};
export declare const generateModel: (pool: ConnectionPool, schemaName: string, translator?: Translator) => Promise<Model>;
export {};
