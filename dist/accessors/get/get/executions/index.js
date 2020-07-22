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
exports.executeGets = void 0;
const get_multiple_1 = require("../../get-multiple");
const flatten = (arr) => arr.reduce((acc, curr) => [...acc, ...curr], []);
const getBatched = (depedencies) => ({ entity, where, isIn }) => __awaiter(void 0, void 0, void 0, function* () {
    const isIntSet = [...new Set(isIn)];
    if (isIntSet.length > 2100) {
        throw new Error(`Batching huge number of gets: ${isIntSet.length}. Reduce query size.`);
    }
    const results = yield get_multiple_1.getMultiple(depedencies)({ entity, where, isIn: isIntSet });
    return { entity, key: where, results };
});
exports.executeGets = (dependencies) => (getsByEntity) => {
    const batchedGets = getsByEntity
        .map(({ entity, keyValues }) => (keyValues.map(({ key, values }) => __awaiter(void 0, void 0, void 0, function* () {
        return getBatched(dependencies)({
            entity,
            where: key,
            isIn: values,
        });
    }))));
    return Promise.all(flatten(batchedGets));
};
//# sourceMappingURL=index.js.map