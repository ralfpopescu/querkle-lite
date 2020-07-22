"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQuervana = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const create_pool_1 = require("./create-pool");
const services_1 = require("./services");
const db_stringifier_1 = require("./services/db-stringifier");
const accessors_1 = require("./accessors");
var create_pool_2 = require("./create-pool");
Object.defineProperty(exports, "createPool", { enumerable: true, get: function () { return create_pool_2.createPool; } });
var generate_model_1 = require("./generate-model");
Object.defineProperty(exports, "generateModel", { enumerable: true, get: function () { return generate_model_1.generateModel; } });
var sql_types_1 = require("./sql-types");
Object.defineProperty(exports, "sqlTypes", { enumerable: true, get: function () { return sql_types_1.sqlTypes; } });
const accessorsWithDependencies = (dependencies) => {
    const prepared = {};
    for (const [name, factory] of Object.entries(accessors_1.accessors)) {
        prepared[name] = factory(dependencies);
    }
    return prepared;
};
exports.initQuervana = (pool, schemaName, model, translator = db_stringifier_1.defaultTranslator) => {
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
    return Object.assign({ close: () => pool.close(), pool,
        model,
        translator, getParamTypes: services_1.getParamTypes(model), stringifier: services_1.dbStringifier, createPool: create_pool_1.createPool, get: accessors_1.get(new dataloader_1.default(accessors_1.getBatchFunction(dependencies))), batchSql: accessors_1.batchSql(new dataloader_1.default(accessors_1.batchSqlFunction(dependencies))) }, preparedAccessors);
};
//# sourceMappingURL=index.js.map