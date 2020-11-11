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
exports.batchSql = exports.batchSqlFunction = void 0;
const serializer_1 = require("./serializer");
const executions_1 = require("./executions");
const prepare_results_1 = require("./prepare-results");
const organizer_1 = require("./organizer");
exports.batchSqlFunction = (dependencies) => (batchedSqls) => __awaiter(void 0, void 0, void 0, function* () {
    const { translator } = dependencies;
    const deserializedBatchedSqls = batchedSqls.map(b => serializer_1.deserializeBatchSql(b));
    const organizedBatchedSqls = organizer_1.organizeBatchedSqls(deserializedBatchedSqls);
    const preparedExecute = executions_1.executeOrganizedBatchedSqls(dependencies);
    const results = yield preparedExecute({ organizedBatchedSqls });
    return prepare_results_1.prepareResultsForDataLoader({
        deserializedBatchedSqls,
        results,
        translator,
    });
});
exports.batchSql = (batchDataLoader) => (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { queryString, params, addToBatch, batchEntity, batchParam } = options, rest = __rest(options, ["queryString", "params", "addToBatch", "batchEntity", "batchParam"]);
    if (addToBatch && (batchEntity == null || batchParam == null)) {
        throw new Error(`Added to batch but did not specify batch entity or batch param. Query string: ${queryString}`);
    }
    if ('transform' in options && typeof options.transform !== 'function') {
        throw new Error('transform parameter is not a function.');
    }
    if ('transformMultiple' in options) {
        if (typeof options.transformMultiple !== 'function') {
            throw new Error('transformMultiple parameter is not a function.');
        }
        if (!('multiple' in options) || ('multiple' in options && !options.multiple)) {
            throw new Error('multiple needs to be set to true to use transformMultiple.');
        }
    }
    return batchDataLoader.load(serializer_1.serializeBatchSql(Object.assign({ queryString,
        params,
        addToBatch,
        batchEntity,
        batchParam }, rest)));
});
//# sourceMappingURL=index.js.map