import pool from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT chave, valor, descricao FROM configuracoes');
    // Transformar array em objeto para facilitar uso no frontend { smtp_host: '...', ... }
    const settings = result.rows.reduce((acc, row) => {
      acc[row.chave] = row.valor;
      return acc;
    }, {});
    res.json(settings);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar configurações' });
  }
};

export const updateSettings = async (req, res) => {
  const updates = req.body; // { smtp_host: '...', smtp_port: '...' }
  try {
    for (const [chave, valor] of Object.entries(updates)) {
      await pool.query(
        'INSERT INTO configuracoes (chave, valor) VALUES ($1, $2) ON CONFLICT (chave) DO UPDATE SET valor = $2, atualizado_em = CURRENT_TIMESTAMP',
        [chave, valor]
      );
    }
    res.json({ success: true, message: 'Configurações atualizadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar configurações' });
  }
};
