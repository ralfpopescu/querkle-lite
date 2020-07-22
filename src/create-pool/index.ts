import sql from 'mssql';

export const createPool = async (config: sql.config) => {
  const pool = new sql.ConnectionPool(config);

  pool.on('error', (err: Error) => {
    throw new Error(`Error starting pool: ${err.name} - ${err.message}`);
  });

  await pool.connect();

  return pool;
};
