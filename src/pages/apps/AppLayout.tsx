import { useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCepStore } from '../../stores/cepStore';
import { Modal } from '../../components/ui/Modal';

export const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { data } = useCepStore();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  // Lógica para transformar xcol em colunas agrupadas pelo tamanhoAmostra
  const historicoAgrupado = useMemo(() => {
    if (!data?.historico?.xcol || !data?.tamanhoAmostra) return null;

    const { xcol, xop, xdata, xhora, xmatricula } = data.historico;
    const tamanho = data.tamanhoAmostra;
    const totalGrupos = Math.ceil(xcol.length / tamanho);

    const colunas = [];
    for (let g = 0; g < totalGrupos; g++) {
      const inicio = g * tamanho;
      const valores = xcol.slice(inicio, inicio + tamanho);

      // Calcula média e amplitude a partir dos valores xcol
      const valoresNumericos = valores.filter(v => !isNaN(v));
      const mediaCalc = valoresNumericos.length > 0
        ? valoresNumericos.reduce((a, b) => a + b, 0) / valoresNumericos.length
        : 0;
      const rangeCalc = valoresNumericos.length > 0
        ? Math.max(...valoresNumericos) - Math.min(...valoresNumericos)
        : 0;

      colunas.push({
        valores,
        op: xop?.[g]?.trim() || '',
        data: xdata?.[g]?.trim() || '',
        hora: xhora?.[g]?.trim() || '',
        matricula: xmatricula?.[g]?.trim() || '',
        media: mediaCalc,
        range: rangeCalc,
      });
    }

    return { colunas, tamanho };
  }, [data]);

  // Total de colunas (max 25, pois 125 valores / 5 amostra = 25 colunas)
  const totalColunas = historicoAgrupado?.colunas.length || 0;
  const maxColunas = Math.max(totalColunas, 25);

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-main">
      <header className="h-[60px] border-b border-border-main px-6 flex items-center justify-end shrink-0 bg-background-secondary">

        {/* Profile Menu e Histórico */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="h-9 px-4 bg-primary hover:bg-primary/90 rounded-lg text-[13px] font-bold text-white transition-colors flex items-center gap-2 shadow-sm"
          >
            <i className="bi bi-clock-history"></i>
            Histórico
          </button>

          <div className="w-[1px] h-6 bg-border-main mx-2"></div>

          <div className="flex flex-col items-end mr-2">
            <span className="text-[13px] font-semibold text-content-main leading-tight">
              {user?.nome}
            </span>
            <span className="text-[11px] text-content-tertiary leading-tight">
              Matrícula: {user?.matricula || '---'}
            </span>
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-9 h-9 rounded-full bg-background-main border border-border-main flex items-center justify-center hover:bg-background-tertiary transition-colors"
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
                      className="w-full text-left px-4 py-2.5 text-[13px] text-content-main hover:bg-background-main transition-colors flex items-center gap-2"
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
                {/* Linha: Data */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Data
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px]">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].data : ''}
                    </td>
                  ))}
                </tr>

                {/* Linha: OP */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    OP
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px]">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].op : ''}
                    </td>
                  ))}
                </tr>

                {/* Linha: Operador (Matrícula) */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Operador
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px]">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].matricula : ''}
                    </td>
                  ))}
                </tr>

                {/* Linha: Hora */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Hora
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px]">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].hora : ''}
                    </td>
                  ))}
                </tr>

                {/* Linhas dos valores (1 a tamanhoAmostra) */}
                {Array.from({ length: data?.tamanhoAmostra || 5 }, (_, valorIndex) => (
                  <tr key={`v${valorIndex}`} className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8">
                    <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                      {valorIndex + 1}
                    </td>
                    {Array.from({ length: maxColunas }, (_, colIndex) => (
                      <td key={colIndex} className="border-r border-border-main text-center last:border-r-0 min-w-[70px] font-mono">
                        {historicoAgrupado && colIndex < totalColunas && valorIndex < historicoAgrupado.colunas[colIndex].valores.length
                          ? historicoAgrupado.colunas[colIndex].valores[valorIndex]
                          : ''}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Linha: Média */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8 bg-blue-50/30">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Média
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px] font-mono font-semibold text-blue-600">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].media.toFixed(2) : ''}
                    </td>
                  ))}
                </tr>

                {/* Linha: Amplitude */}
                <tr className="border-b border-border-main hover:bg-background-tertiary transition-colors h-7 lg:h-8 bg-emerald-50/30">
                  <td className="px-2 border-r border-border-main font-semibold bg-background-secondary w-[85px] sticky left-0 z-10 text-content-secondary truncate text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                    Amplitude
                  </td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center last:border-r-0 min-w-[70px] font-mono font-semibold text-emerald-600">
                      {historicoAgrupado && i < totalColunas ? historicoAgrupado.colunas[i].range.toFixed(2) : ''}
                    </td>
                  ))}
                </tr>

                {/* Linha dos índices embaixo */}
                <tr className="bg-background-secondary h-7 lg:h-8">
                  <td className="px-2 border-r border-border-main bg-background-secondary w-[85px] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"></td>
                  {Array.from({ length: maxColunas }, (_, i) => (
                    <td key={i} className="border-r border-border-main text-center font-bold text-content-tertiary text-[10px] md:text-[11px] last:border-r-0 min-w-[70px]">
                      {i + 1}
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
