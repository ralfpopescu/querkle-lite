/* eslint-disable no-nested-ternary */

export interface Translator {
  readonly objToRel: (str: string) => string;
  readonly relToObj: (str: string) => string;
}

export const camelToSnake = (str) => str.split(/(?=[A-Z])/).join('_').toLowerCase();

export const snakeToCamel = (str) => str.replace(/_([a-z])/g, g => g[1].toUpperCase());

export const keyString = input => `(${Object.keys(input).map(key => camelToSnake(key)).join(',')})`;

export const valueString = paramsObj => `(${Object.keys(paramsObj).map((o) => `?`).join(',')})`;

export const multiValueString = inputArray => inputArray
  .map((item, i) => `(${Object.keys(item)
    .map((o) => `?`).join(',')})`).join(',');

export const stringifyUpdates = (updatedFields: Object, translator: Translator) => {
  const keys = Object.keys(updatedFields);
  const updates = keys.map((key, i) => `${translator.objToRel(key)} = $${i + 1}`);
  return updates.join(',');
};

const parseValue = (value: any) => {
  try {
    const jsonParsed = JSON.parse(value);
    if(jsonParsed && typeof jsonParsed === 'object') {
      return jsonParsed
    }
    return value;
  } catch (e) {
  }

  try {
    const dateParsed = Date.parse(value);
    if(dateParsed) {
      return new Date(dateParsed);
    }
  } catch (e) {
  }

  return value;
}

export const format = <T>(obj: T, relToObj: Translator['relToObj']) => Object
  .keys(obj)
  .map(key => ({ [relToObj(key)]: parseValue(obj[key]) }))
  .reduce((acc, curr) => ({ ...acc, ...curr }));

export const defaultTranslator: Translator = {
  objToRel: camelToSnake,
  relToObj: snakeToCamel,
};
