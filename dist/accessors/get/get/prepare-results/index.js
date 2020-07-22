"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareResults = void 0;
const keyResultsByValue = (results, keyBy) => {
    const keyedResults = { keyBy };
    for (const result of results) {
        const keyValue = result[keyBy];
        const existing = keyedResults[keyValue] || [];
        keyedResults[keyValue] = [...existing, result];
    }
    return keyedResults;
};
const processAllResults = (allResults) => allResults
    .reduce((acc, curr) => {
    const { entity, key, results } = curr;
    const keyedResults = keyResultsByValue(results, key);
    acc[entity] = { [key]: keyedResults };
    return acc;
}, {});
const findResultForGet = (get, processedResults) => {
    const { entity, where, is } = get;
    return processedResults[entity][where][is];
};
exports.prepareResults = (gets, allResults) => {
    const processedResults = processAllResults(allResults);
    return gets
        .map(g => findResultForGet(g, processedResults))
        .map((gResult, i) => {
        const get = gets[i];
        const { returnField, multiple, transform, transformMultiple, } = get;
        if (gResult == null) {
            if (transform) {
                if (multiple) {
                    return gResult.map(() => transform(null));
                }
                return transform(null);
            }
            if (multiple) {
                if (transformMultiple) {
                    return transformMultiple([]);
                }
                return [];
            }
            return null;
        }
        if (returnField) {
            const returnFields = gResult.map(result => result[returnField]);
            return multiple ? returnFields : returnFields[0];
        }
        if (transform) {
            if (multiple) {
                return gResult.map(result => transform(result));
            }
            return transform(gResult[0]);
        }
        if (transformMultiple) {
            return transformMultiple(gResult);
        }
        return multiple ? gResult : gResult[0];
    });
};
//# sourceMappingURL=index.js.map