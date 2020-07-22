import sql from 'mssql';

import { format as dbStringifierFormat, Translator } from './db-stringifier';
import { ColumnType, Model } from '../generate-model';

export { query } from './query';
export * as dbStringifier from './db-stringifier';

const NoNullError = (entity, param) => new Error(`Tried to infer type from a falsy value. entity: ${entity}, param: ${param}`);

export const inferType = (entity, param, value): ColumnType => {
  switch (typeof value) {
    case 'string':
      return sql.VarChar;
    case 'number':
      return value < 2147483647 ? sql.Int : sql.BigInt;
    case 'boolean':
      return sql.Bit;
    case 'undefined':
      throw NoNullError(entity, param);
    case 'symbol':
      throw NoNullError(entity, param);
    default:
      throw NoNullError(entity, param);
  }
};

type DetermineTypeOptions = {
  readonly param: string;
  readonly entity: string;
  readonly model: Model;
  readonly value?: any;
};

export const determineType = ({
  param,
  value,
  entity,
  model,
}: DetermineTypeOptions): ColumnType => {
  const entityModel = model[entity];

  if (!entityModel) {
    throw new Error(`Model for ${entity} is not defined.`);
  }

  if (!entityModel[param]) {
    throw new Error(`Field ${param} on ${entity} is not defined in the model.`);
  }

  return entityModel[param].type || inferType(entity, param, value);
};


export const parseNumber = (
  value: any,
  param: string,
  entity: string,
  model: Model,
) => {
  if (value) {
    return `${value}`;
  }
  if (value == null) return null;

  const sqlType = determineType({
    param,
    entity,
    value,
    model,
  });

  if (sqlType === sql.Int || sqlType === sql.BigInt) {
    return parseInt(value, 10);
  }
  if (sqlType === sql.Float) {
    return parseFloat(value);
  }
  return value;
};

export const format = <T>(recordset: sql.IRecordSet<any>, translator: Translator): ReadonlyArray<T> => {
  if (!recordset) {
    throw new Error(`Operation did not return an array of values. Recordset: ${recordset}`);
  }

  // The TS workaround `as unknown` is needed because there's no TS snake to
  // camel conversion.
  return recordset.map(row => dbStringifierFormat(row, translator.relToObj)) as unknown as ReadonlyArray<T>;
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

export const getParamTypes = (model: Model) => ({ entity, params }) => params
  .map(param => ({ [param]: determineType({ entity, param, model }) }))
  .reduce((acc, curr) => ({ ...acc, ...curr }));

export const makeArbitraryString = (value: string) => `a${value}`;
