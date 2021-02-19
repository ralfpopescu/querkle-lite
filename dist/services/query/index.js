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
exports.query = void 0;
exports.query = ({ queryString, params, pool, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (params) {
        console.log('queryString', queryString);
        console.log('params', params);
        const result = yield pool.all(queryString, params);
        console.log('HERESARESULT', result);
        return result;
    }
    return pool.all(queryString);
});
//# sourceMappingURL=index.js.map