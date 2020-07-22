import sql, { IRow } from 'mssql';

import { Dependencies, ExcludeGeneratedColumns } from '../../index';
import { determineType, format } from '../../../services';

type InsertManyOptions<T> = {
  readonly entity: string;
  readonly inputArray: ReadonlyArray<Partial<ExcludeGeneratedColumns<T>>>;
  readonly returnInserted?: boolean;
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

const serializeColumns = inputArray => Object.keys(inputArray[0]).join('_');

export const insertMany = ({
  pool,
  model,
  translator,
  schemaName,
}: Dependencies) => async <T>({
  entity,
  inputArray,
  returnInserted,
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

  if (returnInserted) {
    const tempTableName = `##staging_${entity}_${serializeColumns(inputArray)}`;
    const createStagingTable = `
    IF OBJECT_ID('tempdb..${tempTableName}') IS NOT NULL
      TRUNCATE TABLE ${tempTableName}
    ELSE
      CREATE TABLE ${tempTableName}
    (
      ${Object.keys(inputArray[0])
      .map(paramName => createColumn(paramName, entity, model, translator))
      .join(', \n')
    }
    )`;

    await pool.query(createStagingTable);

    const tableName = `${tempTableName}`;
    const table = new sql.Table(tableName);
    const params = Object.keys(inputArray[0]);
    params.forEach((param) => table.columns
      .add(
        translator.objToRel(param),
        determineType({ param, entity, model }),
        { nullable: model[entity][param].nullable },
      ));
    inputArray.forEach((input) => {
      const row: IRow = Object.values(input);
      table.rows.add(...row);
    });
    const request = new sql.Request(pool);
    await request.bulk(table);

    const insertIntoPrimaryTable = `
    INSERT INTO ${schemaName}.[${translator.objToRel(entity)}] ( ${Object.keys(inputArray[0]).map(paramName => translator.objToRel(paramName)).join(', ')})
    OUTPUT INSERTED.*
    SELECT ${Object.keys(inputArray[0]).map(paramName => translator.objToRel(paramName)).join(', ')} FROM ${tempTableName};
    `;

    const result = await pool.query(insertIntoPrimaryTable);
    return format(result.recordset, translator);
  }

  const tableName = `${schemaName}.[${translator.objToRel(entity)}]`;
  const table = new sql.Table(tableName);
  const params = Object.keys(inputArray[0]);
  params.forEach(param => table.columns
    .add(
      translator.objToRel(param),
      determineType({ param, entity, model }),
      { nullable: model[entity][param].nullable },
    ));
  inputArray.forEach(input => {
    const row: IRow = Object.values(input);
    table.rows.add(...row);
  });
  const request = new sql.Request(pool);
  await request.bulk(table);
  return inputArray;
};
