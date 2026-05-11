import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/ui/Modal';
import { getLoggedUser, setLoggedUser } from '../data/mockData';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const currentUser = getLoggedUser() || { name: 'Usuário Convidado' };

  const miniApps = [
    { id: 1, name: 'Lançamento - CEP', icon: 'bi-bar-chart-line', path: '/apps/cep', requiresPermission: false },
    { id: 2, name: 'Printers', icon: 'bi-printer', path: '/apps/printers', requiresPermission: false },
    { id: 3, name: 'Resumo por IA', icon: 'bi-robot', path: '', requiresPermission: true },
    { id: 4, name: 'Gerador de Etiquetas', icon: 'bi-palette', path: '/apps/etiquetas', requiresPermission: false },
    { id: 5, name: 'Sobre o App', icon: 'bi-info-circle', path: '/apps/sobre', requiresPermission: false },
  ];

  const filteredApps = miniApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAppClick = (app: typeof miniApps[0]) => {
    if (app.requiresPermission && !currentUser?.isAdmin) {
      setIsModalOpen(true);
    } else {
      navigate(app.path || '#');
    }
  };

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setLoggedUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full bg-background-main flex flex-col">
      {/* Header */}
      <header className="h-[80px] border-b border-border-main px-6 flex items-center justify-between shrink-0 bg-background-main">
        <div className="flex flex-col">
          <div className="text-[20px] font-semibold flex items-center gap-1">
            <span className="text-white">Mini</span>
            <span className="text-primary">Apps</span>
          </div>
          <p className="text-[12px] text-content-secondary">
            Usuário Logado: {currentUser.name} {currentUser.isAdmin && '(Admin)'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"></i>
            <input 
              type="text" 
              placeholder="Encontre um App" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[38px] w-[260px] bg-background-secondary border border-border-main rounded-[999px] pl-10 pr-4 text-[13px] text-content-main placeholder:text-content-tertiary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-10 h-10 rounded-full bg-background-secondary border border-border-main flex items-center justify-center hover:bg-[#1F1F1F] transition-colors"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="grid grid-cols-5 gap-12 w-fit">
          {filteredApps.map(app => (
            <div 
              key={app.id} 
              onClick={() => handleAppClick(app)}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className="w-[96px] h-[96px] rounded-lg bg-background-card border border-border-subtle flex items-center justify-center transition-all duration-200 ease-in-out group-hover:bg-[#1F1F1F] group-hover:-translate-y-[2px]">
                <i className={`bi ${app.icon} text-[28px] text-[rgba(255,255,255,0.65)]`}></i>
              </div>
              <span className="text-[11px] text-content-secondary font-medium text-center">
                {app.name}
              </span>
            </div>
          ))}
          {filteredApps.length === 0 && (
            <div className="col-span-5 flex justify-center py-10">
              <span className="text-content-tertiary text-[13px]">Nenhum app encontrado para "{searchQuery}"</span>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Sem Permissão */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mb-4">
            <i className="bi bi-x-circle text-[32px] text-status-error"></i>
          </div>
          <h3 className="text-[18px] font-semibold text-content-main mb-2">Acesso Negado</h3>
          <p className="text-[14px] text-content-secondary">
            Você não tem permissão para acessar esse app!
          </p>
        </div>
      </Modal>
    </div>
  );
};
