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

async function updateCepApp() {
  try {
    await pool.query(
      "UPDATE aplicativos SET nome = 'Controle estatístico - CEP', icone = 'bi-graph-up' WHERE id = 'cep'"
    );
    console.log('Aplicativo CEP atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar aplicativo CEP:', error);
  } finally {
    await pool.end();
  }
}

updateCepApp();
