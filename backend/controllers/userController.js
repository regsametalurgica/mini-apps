import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Listar todos os usuários (Apenas Admin)
export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, nome, usuario, matricula, role, ativo, criado_em FROM usuarios ORDER BY criado_em DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

// Criar novo usuário (Apenas Admin)
export const createUser = async (req, res) => {
  try {
    const { nome, usuario, matricula, password, role } = req.body;

    if (!nome || !usuario || !password) {
      return res.status(400).json({ message: 'Nome, usuário e senha são obrigatórios.' });
    }

    const normalizedUser = usuario.toLowerCase().trim();
    const { rows: existingUser } = await pool.query('SELECT id FROM usuarios WHERE usuario = $1', [normalizedUser]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Já existe um usuário com este nome de usuário.' });
    }

    const senhaHash = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';

    const { rows: newUser } = await pool.query(
      'INSERT INTO usuarios (nome, usuario, matricula, senha_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, nome, usuario, matricula, role, ativo, criado_em',
      [nome, normalizedUser, matricula || null, senhaHash, userRole]
    );

    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser[0] });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro interno ao criar usuário.' });
  }
};

// Atualizar usuário (Apenas Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, usuario, matricula, password, role, ativo } = req.body;

    const { rows: userRows } = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    const user = userRows[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const normalizedUser = usuario ? usuario.toLowerCase().trim() : user.usuario;

    // Regra: O usuário 'admin' padrão só pode ter a senha alterada
    if (user.usuario === 'admin') {
      if (password) {
        const senhaHash = await bcrypt.hash(password, 10);
        await pool.query('UPDATE usuarios SET senha_hash = $1 WHERE id = $2', [senhaHash, id]);
        return res.json({ message: 'Senha do administrador atualizada com sucesso.' });
      }
      return res.status(400).json({ message: 'Para o usuário admin, apenas a senha pode ser alterada.' });
    }

    let query = 'UPDATE usuarios SET nome = $1, usuario = $2, matricula = $3, role = $4, ativo = $5';
    let params = [nome || user.nome, normalizedUser, matricula !== undefined ? matricula : user.matricula, role || user.role, ativo !== undefined ? ativo : user.ativo];


    if (password) {
      const senhaHash = await bcrypt.hash(password, 10);
      query += ', senha_hash = $5 WHERE id = $6';
      params.push(senhaHash, id);
    } else {
      query += ' WHERE id = $5';
      params.push(id);
    }

    await pool.query(query, params);
    res.json({ message: 'Usuário atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário.' });
  }
};

// Excluir usuário (Apenas Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows: userRows } = await pool.query('SELECT usuario FROM usuarios WHERE id = $1', [id]);
    if (userRows.length > 0 && userRows[0].usuario === 'admin') {
      return res.status(403).json({ message: 'O usuário administrador padrão não pode ser excluído.' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário.' });
  }
};

