const { Pool } = require('pg')
import type { Pool as PoolType } from 'pg'

type PoolOptions = {
  user: string,
  host: string,
  database: string,
  password: string,
  port?: number,
}

export const createPool = async (options?: PoolOptions): Promise<PoolType> => {
  const envOptions = {
    host: "db",
    database: "querkledb",
    user: "querkleuser",
    password: "querklepass"
  }
  const coalescedOptions = { ...envOptions, ...options }

    try {
    const pool = new Pool(coalescedOptions)
    const client = await pool.connect()
    return client;
  } catch (e) {
    throw new Error(`Failed to create pool. ${e}`)
  }
  
};

export const createPoolConnectionString = async (conString: String): Promise<PoolType> => {
    try {
    const pool = new Pool(conString)
    const client = await pool.connect()
    return client;
  } catch (e) {
    throw new Error(`Failed to create pool. ${e}`)
  }
  
};
