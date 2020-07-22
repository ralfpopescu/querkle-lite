import sql from 'mssql';

type ErrorResponse = {
  readonly errorNumber?: number;
  readonly errorSeverity?: number;
  readonly errorState?: string;
  readonly errorProcedure?: string;
  readonly errorLine?: number;
  readonly errorMessage?: string;
};

export type IRecordSetWithError<T> = sql.IRecordSet<T & ErrorResponse>;
export type IResultWithError<T> = sql.IResult<T & ErrorResponse>;

const findErrors = <T>(recordsets: ReadonlyArray<IRecordSetWithError<T>>): IRecordSetWithError<T> => recordsets.find(recordset => {
  if (recordset[0]) {
    return recordset[0].errorNumber != null;
  }

  return false;
});

export const wrapSqlInTryCatch = (queryString: string) => `
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

export const handleErrors = <T>(input: IResultWithError<T>) => {
  const errors = findErrors(input.recordsets);

  if (errors) {
    throw new Error(`MESSAGE: ${errors[0].errorMessage} \n\nLINE:  ${errors[0].errorLine} \n\nSTATE: ${errors[0].errorState}`);
  }

  return input.recordset;
};
