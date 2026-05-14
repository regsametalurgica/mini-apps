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

const apps = [
  { id: 'cep', nome: 'Lançamento - CEP', rota: '/apps/cep', icone: 'bi-geo-alt' },
  { id: 'printers', nome: 'Printers', rota: '/apps/printers', icone: 'bi-printer' },
  { id: 'ia', nome: 'Resumo por IA', rota: '/apps/ia', icone: 'bi-robot' },
  { id: 'etiquetas', nome: 'Gerador de Etiquetas', rota: '/apps/etiquetas', icone: 'bi-tags' },
  { id: 'sobre', nome: 'Sobre o App', rota: '/apps/sobre', icone: 'bi-info-circle' },
  { id: 'apoio-rh', nome: 'Apoio RH', rota: '/apps/apoio-rh', icone: 'bi-people' },
];

async function seedApps() {
  try {
    for (const app of apps) {
      await pool.query(
        'INSERT INTO aplicativos (id, nome, rota, icone) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET nome = $2, rota = $3, icone = $4',
        [app.id, app.nome, app.rota, app.icone]
      );
    }
    console.log('Aplicativos inseridos/atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao inserir aplicativos:', error);
  } finally {
    await pool.end();
  }
}

seedApps();
