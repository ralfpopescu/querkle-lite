import { ConnectionPool, ISqlType, ISqlTypeFactory } from 'mssql';
import { defaultTranslator, Translator } from '../services/db-stringifier';
import { sqlTypes } from '../sql-types';

type KnownSqlTypes =
  'datetime2' |
  'int' |
  'bigint' |
  'float' |
  'decimal' |
  'smallint' |
  'varchar' |
  'bit' |
  'char';

interface SchemaColumn {
  readonly TABLE_SCHEMA: string;
  readonly TABLE_NAME: string;
  readonly COLUMN_NAME: string;
  readonly IS_NULLABLE: string;
  readonly DATA_TYPE: KnownSqlTypes;
  readonly COLUMN_DEFAULT: string | null;
  readonly CHARACTER_MAXIMUM_LENGTH: number | null;
  readonly DATETIME_PRECISION: number | null;
  readonly NUMERIC_PRECISION: number | null;
  readonly NUMERIC_SCALE: number | null;
}

export type ColumnType = (() => ISqlType) | ISqlType;

interface Column {
  type: ColumnType;
  nullable: boolean;
  typeName: string;
  columnDefault?: string | number | null;
}

type Table = { [column: string]: Column };
export type Model = { [table: string]: Table };

export const generateModel = async (
  pool: ConnectionPool,
  schemaName: string,
  translator: Translator = defaultTranslator,
) => {
  const model: Model = {};

  const response = await pool.request().query<SchemaColumn>('SELECT * FROM INFORMATION_SCHEMA.COLUMNS');
  const schema = response.recordset;

  const availableSchemas = new Set();
  for (let i = 0; i < schema.length; i += 1) {
    const item = schema[i];
    const itemSchemaName = item.TABLE_SCHEMA;
    availableSchemas.add(itemSchemaName);
    if (itemSchemaName.toLowerCase() === schemaName.toLowerCase()) {
      const tableName = translator.relToObj(item.TABLE_NAME);
      const columnName = translator.relToObj(item.COLUMN_NAME);
      const nullable = item.IS_NULLABLE === 'YES';
      const type = item.DATA_TYPE;
      const columnDefault = item.COLUMN_DEFAULT;
      const varCharLength = item.CHARACTER_MAXIMUM_LENGTH;
      const datetimePrecision = item.DATETIME_PRECISION;
      const numericPrecision = item.NUMERIC_PRECISION;
      const numericScale = item.NUMERIC_SCALE;

      let sqlType: ColumnType = null;

      switch (type) {
        case 'datetime2':
          sqlType = sqlTypes.dateTime2(datetimePrecision);
          break;
        case 'int':
          sqlType = sqlTypes.int;
          break;
        case 'bigint':
          sqlType = sqlTypes.bigInt;
          break;
        case 'float':
          sqlType = sqlTypes.float;
          break;
        case 'decimal':
          sqlType = sqlTypes.decimal(numericPrecision, numericScale);
          break;
        case 'smallint':
          sqlType = sqlTypes.smallInt;
          break;
        case 'varchar':
          sqlType = sqlTypes.varChar(varCharLength);
          break;
        case 'bit':
          sqlType = sqlTypes.bit;
          break;
        case 'char':
          sqlType = sqlTypes.char(item.CHARACTER_MAXIMUM_LENGTH);
          break;
        default:
          console.log(`SQL type not defined for ${type}`);
      }

      if (model[tableName]) {
        model[tableName][columnName] = {
          type: sqlType,
          typeName: type,
          nullable,
          columnDefault,
        };
      } else {
        model[tableName] = { [columnName]: { type: sqlType, nullable, typeName: type } };
      }
    }
  }

  if (Object.keys(model).length === 0) {
    throw new Error(`Schema ${schemaName} provided no model. Available schemas: ${JSON.stringify(Array.from(availableSchemas))}`);
  }

  return model;
};
