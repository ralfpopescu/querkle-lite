import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { dbStringifier, format, query } from '../../../services';
import { Translator } from '../../../services/db-stringifier';
import refetch from '../../../services/refetch';
import { v4 as uuidv4 } from 'uuid';

const transformInput = (input: Object) => {
  const newInput = { ...input }
  const keys = Object.keys(newInput)
  keys.forEach(key => {
    const value = newInput[key]
    if(typeof value === 'object') {
      return JSON.stringify(value)
    }
  })
  return newInput
}

type InsertOptions<T> = {
  readonly entity: string;
  readonly input: ExcludeGeneratedColumns<T>;
};

const createValueString = (input: object) => {
  const values = Object.values(input)
  return `(?, ${values.map((_) => `?`).join(', ')})`
}

const createKeyString = (input: object, translator: Translator) => {
  const keys = Object.keys(input)
  return `(id, ${keys.map(key => translator.objToRel(key)).join(', ')})`
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

  const id = uuidv4()

  try {
    const response = await query({
      params: [id, ...Object.values(transformInput(input))],
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

  const generatedIds = [id]
  const refetched = await refetch<T>(generatedIds, entity, pool, translator)
  return refetched[0];
};
