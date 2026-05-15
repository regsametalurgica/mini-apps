import express from 'express';
import { login } from '../controllers/authController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getApps, getUserPermissions, updateUserPermissions } from '../controllers/appController.js';
import { iniciarAutomacaoRH, getMarcacoesRH } from '../controllers/rhController.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando perfeitamente!' });
});

// Autenticação
router.post('/auth/login', login);

// Gestão de Usuários (Apenas Administradores)
router.get('/admin/users', verifyToken, isAdmin, getUsers);
router.post('/admin/users', verifyToken, isAdmin, createUser);
router.put('/admin/users/:id', verifyToken, isAdmin, updateUser);
router.delete('/admin/users/:id', verifyToken, isAdmin, deleteUser);


// Gestão de Aplicativos e Permissões
router.get('/admin/apps', verifyToken, getApps); // Liberado para usuários logados
router.get('/admin/user-permissions/:userId', verifyToken, getUserPermissions); // Removido isAdmin para permitir consulta do Dashboard
router.post('/admin/user-permissions', verifyToken, isAdmin, updateUserPermissions);

// Automação RH
router.post('/rh/iniciar-automacao', verifyToken, iniciarAutomacaoRH);
router.get('/rh/marcacoes', verifyToken, getMarcacoesRH);

export default router;
