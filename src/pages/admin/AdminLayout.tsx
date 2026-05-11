import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { setLoggedUser } from '../../data/mockData';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setLoggedUser(null);
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: 'bi-house-door', label: 'Início', exact: true },
    { path: '/admin/usuarios', icon: 'bi-people', label: 'Usuários' },
    { path: '/admin/aplicacoes', icon: 'bi-grid', label: 'Aplicações' },
  ];

  return (
    <div className="flex h-screen w-full bg-background-main text-content-main overflow-hidden">
      
      {/* Sidebar Expandível */}
      <aside className="h-full bg-background-secondary w-[56px] hover:w-[220px] transition-all duration-300 ease-in-out group flex flex-col shrink-0 z-20">
        <div className="h-[64px] flex items-center px-5 shrink-0 border-b border-border-main">
          {/* Opcional: Logo ou marcação */}
          <i className="bi bi-shield-lock text-[18px] text-primary"></i>
          <span className="ml-4 font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Admin
          </span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-2 border-r border-border-main">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path || location.pathname === item.path + '/'
              : location.pathname.startsWith(item.path);
              
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center px-3 py-3 mx-2 rounded-lg transition-colors overflow-hidden ${
                  isActive 
                    ? 'text-content-main' 
                    : 'text-content-secondary hover:bg-background-card hover:text-content-main'
                }`}
              >
                <i className={`bi ${item.icon} text-[18px] shrink-0 ${isActive ? 'text-primary' : ''}`}></i>
                <span className="ml-4 text-[13px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[64px] border-b border-border-main px-6 flex items-center justify-end shrink-0 bg-background-secondary relative z-10">
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full bg-background-main border border-border-main flex items-center justify-center hover:bg-[#1F1F1F] transition-colors"
            >
              <i className="bi bi-person-fill text-[20px] text-content-main"></i>
            </button>

            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute top-12 right-0 w-48 bg-background-secondary border border-border-main rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1">
                  <button 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-content-main hover:bg-[#1F1F1F] transition-colors flex items-center gap-2"
                  >
                    <i className="bi bi-gear"></i>
                    Configurações
                  </button>
                  <div className="h-[1px] bg-border-main my-1 w-full"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-status-error hover:bg-status-error/10 transition-colors flex items-center gap-2"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
