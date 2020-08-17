import sql, { IRow } from 'mssql';

import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { format, query } from '../../../services';

type InsertManyOptions<T> = {
  readonly entity: string;
  readonly inputArray: ReadonlyArray<Partial<ExcludeGeneratedColumns<T>>>;
};

const createColumn = (paramName, entity, model, translator) => {
  const paramTypeName = model[entity][paramName].typeName;
  const { length, precision, scale } = model[entity][paramName].type;

  let suffix = '';

  if (length) suffix = `(${length})`;
  if (scale) suffix = `(${scale})`;
  if (precision && scale) suffix = `(${precision}, ${scale})`;

  return `${translator.objToRel(paramName)} ${paramTypeName}${suffix}${model[entity][paramName].nullable ? '' : ' NOT NULL'}`;
};

const createKeyString = (obj, translator) => `(${Object.keys(obj)
  .map(key => translator.objToRel(key)).join(', ')})`

const createValuesString = (inputArray) => {
  const lengthOfOneInput = Object.keys(inputArray[0]).length
  const numberOfInputs = inputArray.length
  let arrayToAdd = []
  const strArray = []
  for(let i = 0; i < numberOfInputs; i += 1) {
    arrayToAdd = []
    for(let j = 0; j < lengthOfOneInput; j += 1) {
      arrayToAdd.push(`$${i * lengthOfOneInput + j + 1}`) 
    }
    strArray.push(arrayToAdd)
  }
  const str = strArray.map(valueArray => `(${valueArray.join(', ')})`).join(', ')
  console.log(str)
  return str
}

export const insertMany = ({
  pool,
  translator,
}: Dependencies) => async <T>({
  entity,
  inputArray,
}: InsertManyOptions<T>): Promise<ReadonlyArray<T>> => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for insertMany operation.');
  }
  if (inputArray === null || inputArray === undefined) {
    throw new Error(`inputArray was not provided for insertMany operation (entity: ${entity}).`);
  }
  if (!Array.isArray(inputArray)) {
    throw new Error(`inputArray is not array for insertMany operation (entity: ${entity}).`);
  }
  if (
    inputArray.length > 1
    && !inputArray.slice(1).reduce((acc, curr, i) => acc
    && Object.keys(curr).sort().join(',') === Object.keys(inputArray[i]).sort().join(','), true)
  ) {
    throw new Error(`All elements of input array need to have the same keys (entity: ${entity}).`);
  }

  const queryString = `
  INSERT INTO ${translator.objToRel(entity)}${createKeyString(inputArray[0], translator)} 
  VALUES ${createValuesString(inputArray)}
  RETURNING *`

  console.log('queryStringqueryString', queryString)

  const params = inputArray.reduce((acc, curr) => [...acc, ...Object.values(curr)], [])

  console.log('paramsparams', params)

  const response = await query({ queryString, params, pool })

  return format<T>(response, translator);

};
