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
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeHasBatchNoParameterization = exports.executeNoBatch = exports.executeHasBatch = void 0;
const execute_sql_1 = require("../../../execute-sql");
exports.executeHasBatch = (dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, batchValues, }) => __awaiter(void 0, void 0, void 0, function* () {
    const preparedExecuteSql = execute_sql_1.executeSql(dependencies);
    const paramValues = params || [];
    const result = yield preparedExecuteSql({
        queryString,
        params: [...paramValues, ...batchValues],
        multiple: true,
    });
    return {
        result,
        hashedQueryString,
        hashedParamString,
        batchEntity,
        batchParam,
    };
});
exports.executeNoBatch = (dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, }) => __awaiter(void 0, void 0, void 0, function* () {
    const preparedExecuteSql = execute_sql_1.executeSql(dependencies);
    const result = yield preparedExecuteSql({
        queryString,
        params,
        multiple: true,
    });
    return {
        result,
        hashedQueryString,
        hashedParamString,
        batchEntity,
        batchParam,
    };
});
exports.executeHasBatchNoParameterization = (dependencies) => ({ queryString, params, hashedQueryString, hashedParamString, batchEntity, batchParam, }) => __awaiter(void 0, void 0, void 0, function* () {
    const preparedExecuteSql = execute_sql_1.executeSql(dependencies);
    const result = yield preparedExecuteSql({
        queryString,
        params,
        multiple: true,
    });
    return {
        result,
        hashedQueryString,
        hashedParamString,
        batchEntity,
        batchParam,
    };
});
//# sourceMappingURL=index.js.map