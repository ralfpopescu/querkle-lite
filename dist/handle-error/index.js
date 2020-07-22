"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleErrors = exports.wrapSqlInTryCatch = void 0;
const findErrors = (recordsets) => recordsets.find(recordset => {
    if (recordset[0]) {
        return recordset[0].errorNumber != null;
    }
    return false;
});
exports.wrapSqlInTryCatch = (queryString) => `
BEGIN TRY

${queryString}

END TRY

BEGIN CATCH
      SELECT
          ERROR_NUMBER() AS errorNumber
          ,ERROR_SEVERITY() AS errorSeverity
          ,ERROR_STATE() AS errorState
          ,ERROR_PROCEDURE() AS errorProcedure
          ,ERROR_LINE() AS errorLine
          ,ERROR_MESSAGE() AS errorMessage;
  END CATCH
`;
exports.handleErrors = (input) => {
    const errors = findErrors(input.recordsets);
    if (errors) {
        throw new Error(`MESSAGE: ${errors[0].errorMessage} \n\nLINE:  ${errors[0].errorLine} \n\nSTATE: ${errors[0].errorState}`);
    }
    return input.recordset;
};
//# sourceMappingURL=index.js.map