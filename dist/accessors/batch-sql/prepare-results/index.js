"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareResultsForDataLoader = void 0;
const inferParameterRename = ({ queryString, entity, param, translator, }) => {
    const entityRel = translator.objToRel(entity);
    const match = `${entityRel}.${param} as `.toLowerCase();
    const queryStringLowercased = queryString.toLowerCase();
    const indexOfMatch = queryStringLowercased.indexOf(match);
    if (indexOfMatch === -1) {
        return param;
    }
    const indexOfRename = indexOfMatch + match.length;
    const renamedParameter = queryString.substring(indexOfRename, queryString.length).split(' ')[0];
    const ifComma = renamedParameter.split(',')[0];
    const removeWhiteSpace = ifComma.replace(/\s/g, '');
    return translator.relToObj(removeWhiteSpace);
};
const findResultForBatch = ({ deserializedBatch, results, inferedParameterName, addToBatch, }) => {
    const resultSet = results
        .find((result) => (result.hashedQueryString === deserializedBatch.hashedQueryString
        && result.paramString === deserializedBatch.hashedParamString)).result;
    return resultSet.filter(result => `${result[inferedParameterName]}` === `${addToBatch}`);
};
exports.prepareResultsForDataLoader = ({ deserializedBatchedSqls, results, translator, }) => deserializedBatchedSqls
    .map(deserializedBatch => {
    const { addToBatch, batchEntity, batchParam, queryString, multiple, transform, transformMultiple, } = deserializedBatch;
    const inferedParameterName = inferParameterRename({
        queryString,
        entity: batchEntity,
        param: batchParam,
        translator,
    });
    const foundResult = findResultForBatch({
        deserializedBatch,
        results,
        inferedParameterName,
        addToBatch,
    });
    let result;
    if (multiple) {
        if (transformMultiple) {
            result = transformMultiple(foundResult);
            return result;
        }
        if (transform) {
            result = foundResult.map(r => transform(r));
            return result;
        }
        return foundResult;
    }
    if (transform) {
        result = transform(foundResult[0]);
        return result;
    }
    return foundResult[0];
});
//# sourceMappingURL=index.js.map