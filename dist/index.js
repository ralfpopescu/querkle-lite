"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQuerkle = void 0;
const dataloader_1 = __importDefault(require("dataloader"));
const db_stringifier_1 = require("./services/db-stringifier");
const accessors_1 = require("./accessors");
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
    return Object.assign({ close: () => __awaiter(void 0, void 0, void 0, function* () { return pool.close(); }), pool,
        translator, get: accessors_1.get(new dataloader_1.default(accessors_1.getBatchFunction(dependencies))), batchSql: accessors_1.batchSql(new dataloader_1.default(accessors_1.batchSqlFunction(dependencies))) }, preparedAccessors);
};
//# sourceMappingURL=index.js.map