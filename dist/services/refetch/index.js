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
const services_1 = require("../../services");
const refetch = (generatedIds, entity, pool, translator) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('CMONREFETCH');
    const inString = `(${generatedIds.join(', ')})`;
    console.log('inStringinString', inString);
    const queryString = `SELECT * FROM "${translator.objToRel(entity)}" WHERE IN ${inString}`;
    const response = yield services_1.query({
        queryString,
        pool,
        params: null,
    });
    console.log('refetchresponse', response);
    return services_1.format(response, translator);
});
exports.default = refetch;
//# sourceMappingURL=index.js.map