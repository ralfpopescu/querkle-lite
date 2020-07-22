"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlTypes = void 0;
const mssql_1 = __importDefault(require("mssql"));
exports.sqlTypes = {
    bit: mssql_1.default.Bit,
    bigInt: mssql_1.default.BigInt,
    decimal: (precision, scale) => mssql_1.default.Decimal(precision, scale),
    float: mssql_1.default.Float,
    int: mssql_1.default.Int,
    money: mssql_1.default.Money,
    numeric: (precision, scale) => mssql_1.default.Numeric(precision, scale),
    smallInt: mssql_1.default.SmallInt,
    smallMoney: mssql_1.default.SmallMoney,
    real: mssql_1.default.Real,
    tinyInt: mssql_1.default.TinyInt,
    char: (length) => mssql_1.default.Char(length),
    nChar: (length) => mssql_1.default.NChar(length),
    text: mssql_1.default.Text,
    nText: mssql_1.default.NText,
    varChar: length => mssql_1.default.VarChar(length),
    nVarChar: length => mssql_1.default.NVarChar(length),
    xml: mssql_1.default.Xml,
    time: scale => mssql_1.default.Time(scale),
    date: mssql_1.default.Date,
    dateTime: mssql_1.default.DateTime,
    dateTime2: scale => mssql_1.default.DateTime2(scale),
    dateTimeOffset: scale => mssql_1.default.DateTimeOffset(scale),
    smallDateTime: mssql_1.default.SmallDateTime,
    uniqueIdentifier: mssql_1.default.UniqueIdentifier,
    variant: mssql_1.default.Variant,
    binary: mssql_1.default.Binary,
    varBinary: length => mssql_1.default.VarBinary(length),
    image: mssql_1.default.Image,
    udt: mssql_1.default.UDT,
    geography: mssql_1.default.Geography,
    geometry: mssql_1.default.Geometry,
};
//# sourceMappingURL=index.js.map