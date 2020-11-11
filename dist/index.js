"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQuerkle = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const create_pool_1 = require("./create-pool");
const db_stringifier_1 = require("./services/db-stringifier");
const accessors_1 = require("./accessors");
var create_pool_2 = require("./create-pool");
Object.defineProperty(exports, "createPool", { enumerable: true, get: function () { return create_pool_2.createPool; } });
Object.defineProperty(exports, "createPoolConnectionString", { enumerable: true, get: function () { return create_pool_2.createPoolConnectionString; } });
const accessorsWithDependencies = (dependencies) => {
    const prepared = {};
    for (const [name, factory] of Object.entries(accessors_1.accessors)) {
        prepared[name] = factory(dependencies);
    }
    return prepared;
};
exports.initQuerkle = (pool, translator = db_stringifier_1.defaultTranslator) => {
    if (!pool) {
        throw new Error("Pool not provided.");
    }
    const dependencies = { pool, translator };
    const preparedAccessors = accessorsWithDependencies(dependencies);
    return Object.assign({ close: () => pool.end(), pool,
        translator,
        createPool: create_pool_1.createPool,
        createPoolConnectionString: create_pool_1.createPoolConnectionString, get: accessors_1.get(new dataloader_1.default(accessors_1.getBatchFunction(dependencies))), batchSql: accessors_1.batchSql(new dataloader_1.default(accessors_1.batchSqlFunction(dependencies))) }, preparedAccessors);
};
//# sourceMappingURL=index.js.map