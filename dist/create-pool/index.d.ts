import sql from 'mssql';
export declare const createPool: (config: sql.config) => Promise<sql.ConnectionPool>;
