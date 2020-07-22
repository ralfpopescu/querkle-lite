import { ConnectionPool } from 'mssql';

import { insert, insertMany } from './insert';
import { getAll, getMultiple } from './get';
import { remove } from './remove';
import { update } from './update';
import { executeSql } from './execute-sql';
import { Model } from '../generate-model';
import { Translator } from '../services/db-stringifier';

export { get, getBatchFunction } from './get';
export { batchSql, batchSqlFunction } from './batch-sql';

export type IsValue = string | number;
export type ExcludeGeneratedColumns<T> = Omit<T, 'id' | 'udpatedAt' | 'createdAt'>;

export type StringKeys<T> = Extract<keyof T, string>;

export type Transform<T, R> = (record: T) => R;
export type TransformMultiple<T, R> = (records: ReadonlyArray<T>) => R;

export type Dependencies = {
  readonly pool: ConnectionPool;
  readonly model: Model;
  readonly translator: Translator;
  readonly schemaName: string;
};

export type Accessor<O, R> = (options: O) => R;

export const accessors = {
  getAll,
  getMultiple,
  executeSql,
  insert,
  insertMany,
  remove,
  update,
};
