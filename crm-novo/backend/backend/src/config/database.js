import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: true
  }
};

// Criar pool de conexões
let pool;

export const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Pool de conexões MySQL criado');
  }
  return pool;
};

// Testar conexão
export const testConnection = async () => {
  try {
    const connection = await getPool().getConnection();
    console.log('✅ Conexão com banco de dados estabelecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
};

// Executar query
export const query = async (sql, params = []) => {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error.message);
    throw error;
  }
};

// Executar múltiplas queries (transação)
export const transaction = async (queries) => {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.execute(sql, params);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    console.error('❌ Erro na transação:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

export default { getPool, testConnection, query, transaction };

