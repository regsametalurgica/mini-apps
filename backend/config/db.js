import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Só cria o pool se as variáveis de banco estiverem configuradas
const isDbConfigured = process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME;

let pool = null;

if (isDbConfigured) {
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  pool.on('error', (err) => {
    console.error('Erro inesperado no cliente do banco de dados', err);
  });

  console.log('[DB] Conexão com PostgreSQL configurada.');
} else {
  console.log('[DB] Banco de dados NÃO configurado — funcionalidades que dependem do banco estarão indisponíveis.');
}

export default pool;
