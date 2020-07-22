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
exports.executeSql = void 0;
const services_1 = require("../../services");
exports.executeSql = ({ pool, translator, }) => ({ queryString, params, paramTypes, multiple, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield services_1.query({
            queryString,
            params,
            paramTypes,
            pool,
        });
        return multiple ? services_1.format(response, translator) : services_1.format(response, translator)[0];
    }
    catch (e) {
        throw new Error(`executeSql ERROR: ${e.message} --- query string: ${queryString}`);
    }
});
//# sourceMappingURL=index.js.map