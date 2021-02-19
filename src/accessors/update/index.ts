import { format, query } from '../../services';
import { Dependencies, ExcludeGeneratedColumns, IsValue, StringKeys } from '../index';
import { Translator } from '../../services/db-stringifier';
import refetch from '../../services/refetch';

type BaseOptions<T> = {
  readonly entity: string;
  readonly input: Partial<ExcludeGeneratedColumns<T>>;
  readonly where: StringKeys<T>;
  readonly is: IsValue;
  readonly multiple?: boolean;
}

type OptionsSingle<T> = BaseOptions<T> & {
  readonly multiple?: false;
};

type OptionsMultiple<T> = BaseOptions<T> & {
  readonly multiple: true;
};

type Update = {
  <T>(options: OptionsSingle<T>): Promise<T>;
  <T>(options: OptionsMultiple<T>): Promise<ReadonlyArray<T>>;
};

const stringifyUpdates = (updatedFields: Object, translator: Translator) => {
  const keys = Object.keys(updatedFields);
  const updates = keys.map((key, i) => `${translator.objToRel(key)} = ?`);
  return updates.join(',');
};

export const update = ({
  pool,
  translator,
}: Dependencies): Update => async <T>({
  entity,
  input,
  where,
  is,
  multiple,
}) => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for update operation.');
  }
  if (where === null || where === undefined) {
    throw new Error(`'where' parameter was not provided for update operation (entity: ${entity}).`);
  }
  if (input == null) {
    throw new Error(`'input' parameter was not provided for update operation (entity: ${entity}).`);
  }

  const numberOfColumnsToUpdate = Object.keys(input).length

  const queryString = `UPDATE "${translator.objToRel(entity)}"
    SET ${stringifyUpdates(input, translator)}
    WHERE ${translator.objToRel(where)} = ?
  `;

  const values = Object.values(input)

  await query({
    params: [...values, is],
    queryString,
    pool,
  });

  const result = await refetch<T>([is], entity, pool, translator)

  if(result.length === 0) {
    throw new Error(`No update made for ${entity} where ${where} is ${is}: row does not exist.`);
  }

  return multiple ? result : result[0];
};

module.exports = { update };
