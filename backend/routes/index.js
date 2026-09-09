import express from 'express';
import { login } from '../controllers/authController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getApps, getUserPermissions, updateUserPermissions, updateAppSettings } from '../controllers/appController.js';
import { iniciarAutomacaoRH, getMarcacoesRH } from '../controllers/rhController.js';
import { loadCartaCEP, registerMeasurementCEP, loadRecursosCEP, getErpConfigStatus } from '../controllers/cepController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
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
router.put('/admin/apps/:id/settings', verifyToken, isAdmin, updateAppSettings);
router.get('/admin/user-permissions/:userId', verifyToken, getUserPermissions);
router.post('/admin/user-permissions', verifyToken, isAdmin, updateUserPermissions);

// Automação RH
router.post('/rh/iniciar-automacao', verifyToken, iniciarAutomacaoRH);
router.get('/rh/marcacoes', verifyToken, getMarcacoesRH);

// Controle Estatístico de Processo (CEP) — Sem autenticação (acesso direto pelo ERP Protheus)
router.post('/cep/load', loadCartaCEP);
router.post('/cep/recursos', loadRecursosCEP);
router.put('/cep/register', registerMeasurementCEP);

// Status da Integração ERP Protheus (Apenas Admin — somente leitura)
router.get('/admin/erp-config', verifyToken, isAdmin, getErpConfigStatus);

// Configurações do Sistema (Apenas Admin)
router.get('/admin/settings', verifyToken, isAdmin, getSettings);
router.post('/admin/settings', verifyToken, isAdmin, updateSettings);

export default router;
