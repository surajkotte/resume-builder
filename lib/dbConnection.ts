import mysql from "mysql2/promise";
const config = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};
declare global {
  var mysqlPool: mysql.Pool | undefined;
}

// 2. If the pool already exists in globalThis, use it. Otherwise, create a new one.
export const sqldb = globalThis.mysqlPool ?? mysql.createPool(config);

// 3. Save the pool to globalThis only in development mode
if (process.env.NODE_ENV !== "production") {
  globalThis.mysqlPool = sqldb;
}