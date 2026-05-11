import { Outlet, useNavigate } from 'react-router-dom';

export const AppLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-main">
      <header className="h-[60px] border-b border-border-main px-6 flex items-center shrink-0 bg-background-secondary">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[13px] font-medium text-content-secondary hover:text-white transition-colors"
        >
          <i className="bi bi-arrow-left"></i>
          Voltar para o Dashboard
        </button>
      </header>

      <main className="flex-1 overflow-auto relative">
        <Outlet />
      </main>
    </div>
  );
};
