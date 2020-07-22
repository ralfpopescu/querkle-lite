import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { dbStringifier, determineType, format, query } from '../../../services';

const { wrapSqlInTryCatch } = require('../../../handle-error');

type InsertOptions<T> = {
  readonly entity: string;
  readonly input: ExcludeGeneratedColumns<T>;
};

export const insert = ({
  pool,
  model,
  translator,
  schemaName,
}: Dependencies) => async <T>({ entity, input }: InsertOptions<T>) => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for insert operation.');
  }
  if (input === null || input === undefined) {
    throw new Error(`input was not provided for insert operation (entity: ${entity}).`);
  }

  const paramTypes = Object.keys(input)
    .map(key => ({
      [key]: determineType({
        param: key, entity, value: input[key], model,
      }),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }));

  const queryString = wrapSqlInTryCatch(`
    INSERT INTO ${schemaName}.[${translator.objToRel(entity)}] ${dbStringifier.keyString(input)}
    OUTPUT INSERTED.* VALUES ${dbStringifier.valueString(input)}
  `);

  try {
    const response = await query({
      params: (input as any),
      queryString,
      paramTypes,
      pool,
    });
    return format<T>(response, translator)[0];
  } catch (e) {
    if (e.message.includes('conflicted with the FOREIGN KEY constraint')) {
      let table = 'table';
      try {
        table = e.message.split('table "')[1].split('"')[0];
      } catch (error) {
        console.log('Couldn\'t match table from error message.');
      }
      throw new Error(`Insert for ${entity} failed: reference to entry in ${table} that does not exist.`);
    }
    throw new Error(`${entity} insertion failed: ${e.message}`);
  }
};
