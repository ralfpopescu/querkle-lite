import DataLoader from 'dataloader';
import { ConnectionPool } from 'mssql';

import { createPool } from './create-pool';
import { generateModel, Model } from './generate-model';
import { dbStringifier, getParamTypes } from './services';
import { defaultTranslator, Translator } from './services/db-stringifier';
import { accessors, batchSql, batchSqlFunction, Dependencies, get, getBatchFunction } from './accessors';
import { BatchSql } from './accessors/batch-sql';
import { Get } from './accessors/get/get';

export { createPool } from './create-pool';
export { generateModel } from './generate-model';
export { sqlTypes } from './sql-types';

type PreparedAccessors = {
  [K in keyof typeof accessors]: ReturnType<(typeof accessors)[K]>;
}

export type Quervana = {
  readonly close: () => Promise<void>;
  readonly pool: ConnectionPool;
  readonly model: Model;
  readonly translator: Translator;
  readonly getParamTypes: ReturnType<typeof getParamTypes>;
  readonly stringifier: typeof dbStringifier;
  readonly createPool: typeof createPool;
  readonly get: Get;
  readonly batchSql: BatchSql;
} & PreparedAccessors;

const accessorsWithDependencies = (dependencies: Dependencies): PreparedAccessors => {
  const prepared: Partial<PreparedAccessors> = {};

  for (const [name, factory] of Object.entries(accessors)) {
    prepared[name] = factory(dependencies);
  }

  return prepared as PreparedAccessors;
};

export const initQuervana = (
  pool: ConnectionPool,
  schemaName: string,
  model: Model,
  translator: Translator = defaultTranslator,
): Quervana => {
  if (!pool) {
    throw new Error('Pool not provided.');
  }
  if (!schemaName) {
    throw new Error('Schema name not provided.');
  }
  if (!model) {
    throw new Error('Model not provided. Generate one using generateModel.');
  }

  const dependencies = { pool, model, schemaName, translator };
  const preparedAccessors = accessorsWithDependencies(dependencies);

  return {
    close: () => pool.close(),
    pool,
    model,
    translator,
    getParamTypes: getParamTypes(model),
    stringifier: dbStringifier,
    createPool,
    get: get(new DataLoader(getBatchFunction(dependencies))),
    batchSql: batchSql(new DataLoader(batchSqlFunction(dependencies))),
    ...preparedAccessors,
  };
};
