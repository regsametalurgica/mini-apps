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

async function initSettings() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracoes (
        chave VARCHAR(50) PRIMARY KEY,
        valor TEXT,
        descricao TEXT,
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const smtpSettings = [
      { chave: 'smtp_host', valor: process.env.SMTP_HOST || 'smtp.titan.email', descricao: 'Host do servidor SMTP' },
      { chave: 'smtp_port', valor: process.env.SMTP_PORT || '465', descricao: 'Porta do servidor SMTP' },
      { chave: 'smtp_user', valor: process.env.SMTP_USER || '', descricao: 'Usuário do SMTP' },
      { chave: 'smtp_pass', valor: process.env.SMTP_PASS || '', descricao: 'Senha do SMTP' },
      { chave: 'smtp_from', valor: process.env.SMTP_FROM || '', descricao: 'E-mail de remetente padrão' },
    ];

    for (const s of smtpSettings) {
      await pool.query(
        'INSERT INTO configuracoes (chave, valor, descricao) VALUES ($1, $2, $3) ON CONFLICT (chave) DO NOTHING',
        [s.chave, s.valor, s.descricao]
      );
    }

    console.log('Tabela de configurações e registros iniciais criados!');
  } catch (error) {
    console.error('Erro ao inicializar configurações:', error);
  } finally {
    await pool.end();
  }
}

initSettings();
