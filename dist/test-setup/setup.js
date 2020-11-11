// const createDatabase = require('./create-database');
// const config = require('./config');
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// eslint-disable-next-line func-names
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Use this for setup.');
            return process.exit(0);
        }
        catch (err) {
            throw new Error('Error during db setup', err);
        }
    });
}());
//# sourceMappingURL=setup.js.map