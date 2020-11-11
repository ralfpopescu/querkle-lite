import DataLoader from "dataloader";
import type { Pool } from "pg";

import { createPool, createPoolConnectionString } from "./create-pool";
import { defaultTranslator, Translator } from "./services/db-stringifier";
import {
  accessors,
  batchSql,
  batchSqlFunction,
  Dependencies,
  get,
  getBatchFunction,
} from "./accessors";
import { BatchSql } from "./accessors/batch-sql";
import { Get } from "./accessors/get/get";

export { createPool, createPoolConnectionString } from "./create-pool";

type PreparedAccessors = {
  [K in keyof typeof accessors]: ReturnType<typeof accessors[K]>;
};

export type Querkle = {
  readonly close: () => Promise<void>;
  readonly pool: Pool;
  readonly translator: Translator;
  readonly createPool: typeof createPool;
  readonly createPoolConnectionString: typeof createPoolConnectionString;
  readonly get: Get;
  readonly batchSql: BatchSql;
} & PreparedAccessors;

const accessorsWithDependencies = (
  dependencies: Dependencies
): PreparedAccessors => {
  const prepared: Partial<PreparedAccessors> = {};

  for (const [name, factory] of Object.entries(accessors)) {
    prepared[name] = factory(dependencies);
  }

  return prepared as PreparedAccessors;
};

export const initQuerkle = (
  pool: Pool,
  translator: Translator = defaultTranslator
): Querkle => {
  if (!pool) {
    throw new Error("Pool not provided.");
  }

  const dependencies = { pool, translator };
  const preparedAccessors = accessorsWithDependencies(dependencies);

  return {
    close: () => pool.end(),
    pool,
    translator,
    createPool,
    createPoolConnectionString,
    get: get(new DataLoader(getBatchFunction(dependencies))),
    batchSql: batchSql(new DataLoader(batchSqlFunction(dependencies))),
    ...preparedAccessors,
  };
};
