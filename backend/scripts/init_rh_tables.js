import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function initRhTables() {
  console.log('Iniciando criação das tabelas de RH...');

  try {
    // Tabela: funcionarios_regsa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS funcionarios_regsa (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        matricula INTEGER UNIQUE NOT NULL,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE,
        cargo VARCHAR(100),
        departamento VARCHAR(100),
        data_admissao DATE,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "funcionarios_regsa" verificada/criada.');

    // Tabela: rh_marcacoes (Solicitada pelo usuário)
    await pool.query(`DROP TABLE IF EXISTS rh_marcacoes;`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rh_marcacoes (
        id SERIAL PRIMARY KEY,
        relogio_tipo VARCHAR(255),
        pessoa VARCHAR(255),
        pis VARCHAR(50),
        data_hora TIMESTAMP,
        extraido_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela "rh_marcacoes" verificada/criada.');

    console.log('Tabelas de RH inicializadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas de RH:', error);
  } finally {
    await pool.end();
  }
}

initRhTables();
