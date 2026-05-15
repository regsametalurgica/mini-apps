import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { AppLayout } from '../pages/apps/AppLayout';
import { Printers } from '../pages/apps/Printers';
import { LancamentoCep } from '../pages/apps/LancamentoCep';
import { GeradorEtiquetas } from '../pages/apps/GeradorEtiquetas';
import { SobreApp } from '../pages/apps/SobreApp';
import { ApoioRh } from '../pages/apps/ApoioRh';
import { AdminLayout } from '../pages/admin/AdminLayout';
import { AdminHome } from '../pages/admin/AdminHome';
import { Users } from '../pages/admin/Users';
import { Applications } from '../pages/admin/Applications';
import { Settings } from '../pages/admin/Settings';
import { ProtectedRoute } from '../components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas (Requerem Login) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Rotas dos Mini Apps encapsuladas no Layout Base */}
          <Route path="/apps" element={<AppLayout />}>
            <Route path="printers" element={<Printers />} />
            <Route path="cep" element={<LancamentoCep />} />
            <Route path="etiquetas" element={<GeradorEtiquetas />} />
            <Route path="sobre" element={<SobreApp />} />
            <Route path="apoio-rh" element={<ApoioRh />} />
          </Route>
        </Route>

        {/* Rotas do Painel Admin (Apenas Administradores) */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="aplicacoes" element={<Applications />} />
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
