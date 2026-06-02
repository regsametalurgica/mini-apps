import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Modal } from '../../components/ui/Modal';

export const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-main">
      <header className="h-[60px] border-b border-border-main px-6 flex items-center justify-between shrink-0 bg-background-secondary">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[13px] font-medium text-content-secondary hover:text-white transition-colors"
        >
          <i className="bi bi-arrow-left"></i>
          Voltar para o Dashboard
        </button>

        {/* Profile Menu e Histórico */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-9 px-4 bg-[#2D8C63] hover:bg-[#2D8C63]/90 rounded-lg text-[13px] font-bold text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <i className="bi bi-clock-history"></i>
            Histórico
          </button>

          <div className="w-[1px] h-6 bg-border-main mx-2"></div>

          <div className="flex flex-col items-end mr-2">
            <span className="text-[13px] font-semibold text-white leading-tight">
              {user?.nome}
            </span>
            <span className="text-[11px] text-content-tertiary leading-tight">
              Matrícula: {user?.matricula || '---'}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full bg-background-main border border-border-main flex items-center justify-center hover:bg-[#1F1F1F] transition-colors"
            >
              <i className="bi bi-person-fill text-[18px] text-content-main"></i>
            </button>

            {isProfileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute top-11 right-0 w-48 bg-background-secondary border border-border-main rounded-lg shadow-xl z-50 overflow-hidden flex flex-col py-1">
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => navigate('/admin')}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-white hover:bg-background-main transition-colors flex items-center gap-2"
                    >
                      <i className="bi bi-speedometer2"></i>
                      Painel Admin
                    </button>
                  )}
                  <button 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-content-main hover:bg-background-main transition-colors flex items-center gap-2"
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

      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>

      {/* Modal de Histórico */}
      {isHistoryModalOpen && (
        <Modal 
          isOpen={true} 
          onClose={() => setIsHistoryModalOpen(false)}
          className="max-w-[96vw] !p-4 !pt-12"
        >
          <div className="w-full border border-border-main rounded-lg overflow-x-auto custom-scrollbar">
            <table className="w-full text-[11px] md:text-[12px] text-content-main bg-background-main border-collapse min-w-max">
              <tbody>
                {['Data', 'OP', 'Operador', 'Hora', '1', '2', '3', '4', '5', 'Média', 'Amplitude'].map((label, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border-main hover:bg-[#1A1A1A] transition-colors h-7 lg:h-8">
                    <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                      {label}
                    </td>
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((col) => (
                      <td key={col} className="border-r border-border-main text-center last:border-r-0 min-w-[70px]">
                        {/* Futuramente dados aqui */}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Linha dos índices embaixo */}
                <tr className="bg-background-secondary h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main bg-background-secondary w-[85px] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"></td>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((col) => (
                    <td key={col} className="border-r border-border-main text-center font-bold text-content-tertiary text-[10px] md:text-[11px] last:border-r-0 min-w-[70px]">
                      {col}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
