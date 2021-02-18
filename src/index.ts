import DataLoader from "dataloader";
import type { Database } from "sqlite3";

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

type PreparedAccessors = {
  [K in keyof typeof accessors]: ReturnType<typeof accessors[K]>;
};

export type Querkle = {
  readonly close: () => Promise<void>;
  readonly pool: Database;
  readonly translator: Translator;
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
  pool: Database,
  translator: Translator = defaultTranslator
): Querkle => {
  if (!pool) {
    throw new Error("Pool not provided.");
  }

  const dependencies = { pool, translator };
  const preparedAccessors = accessorsWithDependencies(dependencies);

  return {
    close: async () => pool.close(),
    pool,
    translator,
    get: get(new DataLoader(getBatchFunction(dependencies))),
    batchSql: batchSql(new DataLoader(batchSqlFunction(dependencies))),
    ...preparedAccessors,
  };
};
