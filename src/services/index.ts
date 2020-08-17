import type { QueryResult } from 'pg'

import { format as dbStringifierFormat, Translator } from './db-stringifier';

export { query } from './query';
export * as dbStringifier from './db-stringifier';

export const format = <T>(recordset: QueryResult<any>, translator: Translator): ReadonlyArray<T> => {
  if (!recordset) {
    throw new Error(`Operation did not return an array of values. Recordset: ${recordset}`);
  }

  // The TS workaround `as unknown` is needed because there's no TS snake to
  // camel conversion.
  return recordset.rows.map(row => dbStringifierFormat(row, translator.relToObj)) as unknown as ReadonlyArray<T>;
};

export const stringifyGet = ({
  entity,
  where,
  is,
  multiple,
  returnField,
}) => `${entity}-${where}-${is}-${multiple ? 'y' : 'n'}-${returnField || 'null'}`;

export const parseGetString = (key: string) => key
  .split('-')
  .map((item, i) => {
    if (i === 0) {
      return { entity: item };
    }
    if (i === 1) {
      return { where: item };
    }
    if (i === 2) {
      return { is: item === 'null' ? null : item };
    }
    if (i === 3) {
      return { multiple: item === 'y' };
    }
    return { returnField: item === 'null' ? null : item };
  })
  .reduce((acc, curr) => ({ ...acc, ...curr }), {});
