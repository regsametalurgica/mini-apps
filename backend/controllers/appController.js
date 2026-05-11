import pool from '../config/db.js';

// Listar todos os aplicativos
export const getApps = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM aplicativos WHERE ativo = true ORDER BY nome');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar aplicativos:', error);
    res.status(500).json({ message: 'Erro ao buscar aplicativos.' });
  }
};

// Buscar permissões de um usuário específico
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows } = await pool.query(
      'SELECT aplicativo_id FROM usuarios_aplicativos WHERE usuario_id = $1',
      [userId]
    );
    // Retornar apenas um array de IDs
    res.json(rows.map(r => r.aplicativo_id));
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({ message: 'Erro ao buscar permissões.' });
  }
};

// Atualizar permissões de um usuário (vincular apps)
export const updateUserPermissions = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId, appIds } = req.body; // appIds deve ser um array de strings

    if (!userId || !Array.isArray(appIds)) {
      return res.status(400).json({ message: 'Dados inválidos.' });
    }

    await client.query('BEGIN');

    // 1. Remover permissões atuais
    await client.query('DELETE FROM usuarios_aplicativos WHERE usuario_id = $1', [userId]);

    // 2. Inserir novas permissões
    for (const appId of appIds) {
      await client.query(
        'INSERT INTO usuarios_aplicativos (usuario_id, aplicativo_id) VALUES ($1, $2)',
        [userId, appId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Permissões atualizadas com sucesso!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ message: 'Erro ao atualizar permissões.' });
  } finally {
    client.release();
  }
};
