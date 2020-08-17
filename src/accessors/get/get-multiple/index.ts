import { Dependencies, IsValue, StringKeys } from '../../index';

import { format, query } from '../../../services';

type GetMultipleAccessorOptions<T> = {
  readonly entity: string;
  readonly where: StringKeys<T>;
  readonly isIn: ReadonlyArray<IsValue>;
  readonly parameterize?: boolean;
};

export const getMultiple = ({
  pool,
  translator,
}: Dependencies) => async <T>({
  entity,
  where,
  isIn,
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
  if (!Array.isArray(isIn)) {
    throw new Error(`'isIn' parameter provided is not an array (entity: ${entity}).`);
  }
  
  const valueString = isIn.map((_, i) => `$${i + 1}`).join(', ')

  const queryString = `
    SELECT * FROM "${translator.objToRel(entity)}"
    WHERE ${translator.objToRel(where)} IN (${valueString});
  `;

  const response = await query({
    queryString,
    params: isIn,
    pool,
  });
  return format(response, translator);
};
