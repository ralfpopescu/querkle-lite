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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeOrganizedBatchedSqls = void 0;
const execute_1 = require("./execute");
const sql_types_1 = require("../../../sql-types");
exports.executeOrganizedBatchedSqls = (dependencies) => ({ organizedBatchedSqls }) => __awaiter(void 0, void 0, void 0, function* () {
    const { model } = dependencies;
    const hashedQueryStrings = Object.keys(organizedBatchedSqls);
    const promises = hashedQueryStrings.map(hashedQueryString => {
        const _a = organizedBatchedSqls[hashedQueryString], { queryString, parameterize } = _a, hashedParamStrings = __rest(_a, ["queryString", "parameterize"]);
        return Object
            .keys(hashedParamStrings)
            .map(hashedParamString => {
            const { params, batchEntity, batchParam, addToBatches, paramTypes, } = hashedParamStrings[hashedParamString];
            const findBatchKey = queryString.indexOf('[BATCH]');
            if (findBatchKey === -1) {
                return execute_1.executeNoBatch(dependencies)({
                    queryString,
                    params,
                    paramTypes,
                    hashedQueryString,
                    hashedParamString,
                    batchEntity,
                    batchParam,
                });
            }
            let batchString;
            const batchParamType = model[batchEntity][batchParam].type;
            if (parameterize !== true) {
                const doStringify = !(batchParamType === sql_types_1.sqlTypes.bit
                    || batchParamType === sql_types_1.sqlTypes.bigInt
                    || batchParamType === sql_types_1.sqlTypes.int
                    || batchParamType === sql_types_1.sqlTypes.smallInt
                    // @ts-ignore
                    || batchParamType === sql_types_1.sqlTypes.decimal
                    || batchParamType === sql_types_1.sqlTypes.float);
                batchString = `(${[...new Set(addToBatches
                        .map(value => (doStringify ? `'${value}'` : value)))]
                    .join(', ')})`;
                const newQueryString = queryString.replace('[BATCH]', batchString);
                return execute_1.executeHasBatchNoParameterization(dependencies)({
                    queryString: newQueryString,
                    params,
                    paramTypes,
                    hashedQueryString,
                    hashedParamString,
                    batchEntity,
                    batchParam,
                });
            }
            const batchValues = addToBatches
                .map((addToBatch, i) => ({ [`batch${i}`]: addToBatch }))
                .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
            const batchTypes = Object
                .keys(batchValues)
                .map(key => ({ [key]: batchParamType }))
                .reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
            batchString = `(${Object.keys(batchValues).map(key => `@${key}`).join(', ')})`;
            const newQueryString = queryString.replace('[BATCH]', batchString);
            return execute_1.executeHasBatch(dependencies)({
                queryString: newQueryString,
                params,
                batchValues,
                paramTypes,
                batchTypes,
                hashedQueryString,
                hashedParamString,
                batchEntity,
                batchParam,
            });
        });
    }).reduce((acc, curr) => ([...acc, ...curr]));
    return Promise.all(promises);
});
//# sourceMappingURL=index.js.map