"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizer = void 0;
const serializer_1 = require("../serializer");
exports.organizer = (gets) => {
    const deserializedGets = gets.map(g => serializer_1.deserializeGet(g));
    const entities = [...new Set(deserializedGets.map(g => g.entity))];
    return entities.map((entity) => ({
        entity,
        keyValues: [...new Set(deserializedGets
                .filter(g => g.entity === entity)
                .map(g => g.where))]
            .map((key) => ({
            key,
            values: deserializedGets
                .filter(g => g.entity === entity)
                .map(g => g.is),
        })),
    }));
};
//# sourceMappingURL=index.js.map