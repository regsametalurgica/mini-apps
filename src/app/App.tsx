import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AppLayout } from '../pages/apps/AppLayout';
import { LancamentoCep } from '../pages/apps/LancamentoCep';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminHome } from '../pages/admin/AdminHome';
import { Users } from '../pages/admin/Users';
import { Settings } from '../pages/admin/Settings';
import { ProtectedRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas (Requerem Login) */}
        <Route element={<ProtectedRoute />}>
          {/* Rota principal do CEP encapsulada no Layout Base */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LancamentoCep />} />
            {/* Redirecionamentos de legado para manter a UX caso existam links antigos */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/apps/*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>

        {/* Rotas do Painel Admin (Apenas Administradores) */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="configuracoes" element={<Settings />} />
          </Route>
        </Route>

        {/* Redirecionamento padrão para login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
