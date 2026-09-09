import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../pages/apps/AppLayout';
import { LancamentoCep } from '../pages/apps/LancamentoCep';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminHome } from '../pages/admin/AdminHome';
import { Users } from '../pages/admin/Users';
import { Settings } from '../pages/admin/Settings';
import { Login } from '../pages/Login';
import { ProtectedRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota principal do CEP — acesso direto, sem autenticação */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LancamentoCep />} />
          {/* Redirecionamentos de legado */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/apps/*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Rotas do Painel Admin (mantidas com login) */}
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Route>

        {/* Redirecionamento padrão para a página principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
