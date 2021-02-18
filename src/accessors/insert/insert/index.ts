import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { dbStringifier, format, query } from '../../../services';
import { Translator } from '../../../services/db-stringifier';
import refetch from '../../../services/refetch';

const { wrapSqlInTryCatch } = require('../../../handle-error');

type InsertOptions<T> = {
  readonly entity: string;
  readonly input: ExcludeGeneratedColumns<T>;
};

const createValueString = (input: object) => {
  const values = Object.values(input)
  return `(${values.map((_) => `?`).join(', ')})`
}

const createKeyString = (input: object, translator: Translator) => {
  const keys = Object.keys(input)
  return `(${keys.map(key => translator.objToRel(key)).join(', ')})`
}

export const insert = ({
  pool,
  translator,
}: Dependencies) => async <T>({ entity, input }: InsertOptions<T>) => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for insert operation.');
  }
  if (input === null || input === undefined) {
    throw new Error(`input was not provided for insert operation (entity: ${entity}).`);
  }

  const queryString =`
    INSERT INTO "${translator.objToRel(entity)}" ${createKeyString(input, translator)}
    VALUES ${createValueString(input)}
  `;

  try {
    const response = await query({
      params: Object.values(input),
      queryString,
      pool,
    });
    
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

  return refetch<T>(entity, pool, translator)[0];
};
