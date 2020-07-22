"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizeBatchedSqls = void 0;
const serializer_1 = require("../serializer");
const organizeByQueryString = (deserializedBatchedSqls) => (deserializedBatchedSqls
    .reduce((acc, curr) => {
    const { hashedQueryString } = curr;
    if (acc[hashedQueryString]) {
        return Object.assign(Object.assign({}, acc), { [hashedQueryString]: [...acc[hashedQueryString], curr] });
    }
    return Object.assign(Object.assign({}, acc), { [hashedQueryString]: [curr] });
}, {}));
exports.organizeBatchedSqls = (deserializedBatchedSqls) => {
    const organizedByQueryString = organizeByQueryString(deserializedBatchedSqls);
    const queryStringKeys = Object.keys(organizedByQueryString);
    return queryStringKeys.map(qs => {
        const queryStringBatched = organizedByQueryString[qs];
        const organizedByParamString = queryStringBatched.reduce((acc, curr) => {
            const { paramString } = curr;
            if (acc[paramString]) {
                return Object.assign(Object.assign({}, acc), { [paramString]: Object.assign(Object.assign({}, acc[paramString]), { addToBatches: [...acc[paramString].addToBatches, curr.addToBatch] }) });
            }
            return Object.assign(Object.assign({}, acc), { queryString: serializer_1.decode(qs), parameterize: curr.parameterize, [paramString]: {
                    params: curr.params,
                    paramTypes: curr.paramTypes,
                    multiple: curr.multiple,
                    batchEntity: curr.batchEntity,
                    batchParam: curr.batchParam,
                    addToBatches: [curr.addToBatch],
                } });
        }, {});
        return { [qs]: organizedByParamString };
    }).reduce((acc, curr) => (Object.assign(Object.assign({}, acc), curr)));
};
//# sourceMappingURL=index.js.map