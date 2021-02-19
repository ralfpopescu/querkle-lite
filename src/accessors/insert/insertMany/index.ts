import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { format, query } from '../../../services';
import { v4 as uuidv4 } from 'uuid';

type InsertManyOptions<T> = {
  readonly entity: string;
  readonly inputArray: ReadonlyArray<Partial<ExcludeGeneratedColumns<T>>>;
};


const createKeyString = (obj, translator) => `(id, ${Object.keys(obj)
  .map(key => translator.objToRel(key)).join(', ')})`

const createValuesString = (inputArray) => {
  const lengthOfOneInput = Object.keys(inputArray[0]).length
  const numberOfInputs = inputArray.length
  let arrayToAdd = []
  const strArray = []
  for(let i = 0; i < numberOfInputs; i += 1) {
    arrayToAdd = []
    for(let j = 0; j < lengthOfOneInput; j += 1) {
      arrayToAdd.push(`?`) 
    }
    strArray.push(arrayToAdd)
  }
  const str = strArray.map(valueArray => `(?, ${valueArray.join(', ')})`).join(', ')
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
`

  const params = inputArray.reduce((acc, curr) => [...acc, uuidv4(), ...Object.values(curr)], [])

  const response = await query({ queryString, params, pool })

  return format<T>(response, translator);

};
