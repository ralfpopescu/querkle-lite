import { dbStringifier, determineType, format, getParamTypes, query } from '../../services';
import { Dependencies, ExcludeGeneratedColumns, IsValue, StringKeys } from '../index';

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

export const update = ({
  pool,
  model,
  translator,
  schemaName,
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

  const queryString = `UPDATE ${schemaName}.[${translator.objToRel(entity)}]
    SET ${dbStringifier.stringifyUpdates(input)}
    WHERE ${translator.objToRel(where)} = @is;

    SELECT * FROM ${schemaName}.[${translator.objToRel(entity)}]
    WHERE ${translator.objToRel(where)} = @is;
  `;

  const response = await query({
    params: { is, ...input },
    paramTypes: {
      is: determineType({
        param: where, entity, value: is, model,
      }),
      ...getParamTypes(model)({ entity, params: Object.keys(input) }),
    },
    queryString,
    pool,
  });

  if (response.length === 0) {
    throw new Error(`No update made for ${entity} where ${where} is ${is}: row does not exist.`);
  }

  return multiple ? format<T>(response, translator) : format<T>(response, translator)[0];
};

module.exports = { update };
