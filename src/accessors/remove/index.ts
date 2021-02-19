import { format, query } from '../../services';
import { Dependencies, IsValue, StringKeys } from '../index';
import refetch from '../../services/refetch';

type BaseOptions<T> = {
  readonly entity: string;
  readonly where: StringKeys<T>;
  readonly is: IsValue;
};

type RemoveOptionsSingle<T> = BaseOptions<T> & {
  readonly multiple?: false;
};

type RemoveOptionsMultiple<T> = BaseOptions<T> & {
  readonly multiple: true;
};

type WithQuantity<T> = T & { readonly quantity: number };

type Remove = {
  <T>(options: RemoveOptionsSingle<T>): Promise<WithQuantity<T>>;
  <T>(options: RemoveOptionsMultiple<T>): Promise<ReadonlyArray<WithQuantity<T>>>;
};

export const remove = ({
  pool,
  translator,
}: Dependencies): Remove => async <T>({
  entity,
  where,
  is,
  multiple,
}) => {
  if (entity === null || entity === undefined) {
    throw new Error('entity was not provided for remove operation.');
  }
  if (where === null || where === undefined) {
    throw new Error(`'where' parameter was not provided for remove operation (entity: ${entity}).`);
  }
  if (is === null || is === undefined) {
    throw new Error(`'is' parameter was null or undefined for remove operation (entity: ${entity}).
    If intentionally want to delete where some field is null, please write custom SQL.`);
  }

  const queryString = `
    DELETE FROM "${translator.objToRel(entity)}"
    WHERE ${translator.objToRel(where)} = ?;
  `;

  const result = await refetch<T>([is], entity, pool, translator)

  if(result.length === 0) {
    throw new Error(`No delete made for ${entity} where ${where} is ${is}: row does not exist.`);
  }

  await query({
    params: [is],
    queryString,
    pool,
  });

  

  return multiple ? result : result[0];
};
