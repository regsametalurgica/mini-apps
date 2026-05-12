import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

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

async function seedUsers() {
  console.log('Iniciando seed de usuários...');
  
  try {
    const adminPasswordHash = await bcrypt.hash('admin', 10);
    const userPasswordHash = await bcrypt.hash('usuario', 10);

    // Inserir Admin
    await pool.query(
      `INSERT INTO usuarios (nome, usuario, matricula, senha_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (usuario) DO NOTHING`,
      ['Administrador', 'admin', 1, adminPasswordHash, 'admin']
    );
    console.log('Usuário admin criado/verificado.');

    // Inserir Usuario comum
    await pool.query(
      `INSERT INTO usuarios (nome, usuario, matricula, senha_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       ON CONFLICT (usuario) DO NOTHING`,
      ['Usuário Teste', 'usuario', 999, userPasswordHash, 'user']
    );
    console.log('Usuário comum criado/verificado.');

    console.log('Seed finalizado com sucesso!');
  } catch (error) {
    console.error('Erro no seed de usuários:', error);
  } finally {
    await pool.end();
  }
}

seedUsers();
