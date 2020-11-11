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
exports.executeOrganizedBatchedSqls = (dependencies) => ({ organizedBatchedSqls }) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedQueryStrings = Object.keys(organizedBatchedSqls);
    const promises = hashedQueryStrings.map(hashedQueryString => {
        const _a = organizedBatchedSqls[hashedQueryString], { queryString, parameterize } = _a, hashedParamStrings = __rest(_a, ["queryString", "parameterize"]);
        return Object
            .keys(hashedParamStrings)
            .map(hashedParamString => {
            const { params, batchEntity, batchParam, addToBatches, } = hashedParamStrings[hashedParamString];
            const findBatchKey = queryString.indexOf('[BATCH]');
            if (findBatchKey === -1) {
                return execute_1.executeNoBatch(dependencies)({
                    queryString,
                    params,
                    hashedQueryString,
                    hashedParamString,
                    batchEntity,
                    batchParam,
                });
            }
            const batchValues = [...addToBatches];
            const batchString = `(${addToBatches.map((_, i) => `$${i + 1 + (params ? params.length : 0)}`).join(', ')})`;
            const newQueryString = queryString.replace('[BATCH]', batchString);
            return execute_1.executeHasBatch(dependencies)({
                queryString: newQueryString,
                params,
                batchValues,
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