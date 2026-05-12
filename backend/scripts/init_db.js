import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar .env a partir da raiz do projeto
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function initDB() {
  console.log('Iniciando criação das tabelas...');

  try {
    // Tabela: usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        usuario VARCHAR(255) UNIQUE NOT NULL,
        matricula INTEGER,
        senha_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "usuarios" verificada/criada.');

    // Tabela: aplicativos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS aplicativos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        rota VARCHAR(255) UNIQUE NOT NULL,
        icone VARCHAR(100),
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "aplicativos" verificada/criada.');

    // Tabela: usuarios_aplicativos (Pivot)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios_aplicativos (
        usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
        aplicativo_id UUID REFERENCES aplicativos(id) ON DELETE CASCADE,
        concedido_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (usuario_id, aplicativo_id)
      );
    `);
    console.log('Tabela "usuarios_aplicativos" verificada/criada.');

    console.log('Estrutura de banco de dados inicializada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  } finally {
    await pool.end();
  }
}

initDB();
