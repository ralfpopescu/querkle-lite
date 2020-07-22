import { Dependencies, IsValue, StringKeys } from '../../index';

import { dbStringifier, determineType, format, makeArbitraryString, parseNumber, query } from '../../../services';

type GetMultipleAccessorOptions<T> = {
  readonly entity: string;
  readonly where: StringKeys<T>;
  readonly isIn: ReadonlyArray<IsValue>;
  readonly parameterize?: boolean;
};

const objectReducer = (acc, curr) => {
  for (const key in curr) {
    if (Object.prototype.hasOwnProperty.call(curr, key)) {
      acc[key] = curr[key];
    }
  }
  return acc;
};

const createUnparameterizedValueString = (entity, where, model, isIn) => isIn.map(value => {
  if (value == null) {
    return 'NULL';
  }

  const paramTypeName = model[entity][where].typeName;
  if (paramTypeName === 'int'
    || paramTypeName === 'decimal'
    || paramTypeName === 'smallint'
    || paramTypeName === 'bit') {
    return value;
  }

  return `'${value}'`;
}).join(' ,');

export const getMultiple = ({
  pool,
  model,
  translator,
  schemaName,
}: Dependencies) => async <T>({
  entity,
  where,
  isIn,
  parameterize,
}: GetMultipleAccessorOptions<T>): Promise<ReadonlyArray<T>> => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for getMultiple operation.');
  }
  if (where === null || where === undefined) {
    throw new Error(`'where' parameter was not provided for getMultiple operation (entity: ${entity}).`);
  }
  if (!isIn) {
    throw new Error(`'isIn' parameter was not provided for getMultiple operation (entity: ${entity}).`);
  }
  if (!model[entity]) {
    throw new Error(`Model does not contain entity (entity: ${entity}).`);
  }
  // @ts-ignore
  if (!model[entity][where]) {
    throw new Error(`Model does not contain column for entity (entity: ${entity}, column: ${where}).`);
  }
  if (!Array.isArray(isIn)) {
    throw new Error(`'isIn' parameter provided is not an array (entity: ${entity}).`);
  }

  if (parameterize !== true) {
    const queryString = `
      SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}]
      WHERE ${translator.objToRel(where)} IN (${createUnparameterizedValueString(entity, where, model, isIn)});
    `;

    // TODO: Fix types here.
    // @ts-ignore
    const response = await query({
      queryString,
      pool,
    });

    return format(response, translator);
  }

  const paramTypes = isIn
    .map(value => ({
      // TODO: Fix types here.
      // @ts-ignore
      [makeArbitraryString(value)]: determineType({
        param: where,
        entity,
        model,
      }),
    }))
    .reduce(objectReducer, {});

  const params = isIn
    .map(value => ({ [makeArbitraryString(value)]: parseNumber(value, where, entity, model) }))
    .reduce(objectReducer, {});

  const queryString = `
    SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}]
    WHERE ${translator.objToRel(where)} IN ${dbStringifier.valueString(params)};
  `;

  const response = await query({
    queryString,
    params,
    paramTypes,
    pool,
  });
  return format(response, translator);
};
