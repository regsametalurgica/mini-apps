import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';

type MenuOption = 'marcacoes' | 'chat-ia' | 'encontrar-profissional';

interface Marcacao {
  id: number;
  relogio_tipo: string;
  pessoa: string;
  pis: string;
  data_hora: string;
}

export const ApoioRh = () => {
  const [activeTab, setActiveTab] = useState<MenuOption>('marcacoes');

  const menuItems = [
    { id: 'marcacoes' as MenuOption, label: 'Agente de Marcações', icon: 'bi-calendar-check' },
    { id: 'chat-ia' as MenuOption, label: 'Chat IA Local', icon: 'bi-robot' },
    { id: 'encontrar-profissional' as MenuOption, label: 'Encontrar Profissional', icon: 'bi-search' },
  ];

  const [automationStatus, setAutomationStatus] = useState<'idle' | 'running' | 'error' | 'done'>('idle');
  const [automationLogs, setAutomationLogs] = useState<{ step: number | string; message: string }[]>([]);
  const [marcacoes, setMarcacoes] = useState<Marcacao[]>([]);
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);
  const [loadingMarcacoes, setLoadingMarcacoes] = useState(false);

  const fetchMarcacoes = useCallback(async () => {
    setLoadingMarcacoes(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/rh/marcacoes?data=${filtroData}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMarcacoes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar marcações:', error);
    } finally {
      setLoadingMarcacoes(false);
    }
  }, [filtroData]);

  useEffect(() => {
    if (activeTab === 'marcacoes') {
      fetchMarcacoes();
    }
  }, [fetchMarcacoes, activeTab]);

  const handleIniciarAutomacao = async () => {
    setAutomationStatus('running');
    setAutomationLogs([]);

    const MAX_ATTEMPTS = 3;
    const RETRY_DELAY_MS = 3 * 60 * 1000; // 3 minutos

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          setAutomationLogs(prev => [...prev, { step: 'RETRY', message: `Tentativa de conexão ${attempt}/${MAX_ATTEMPTS}...` }]);
        }

        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/rh/iniciar-automacao', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.body) throw new Error('Não foi possível obter o stream de dados.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            setAutomationStatus(prev => prev === 'error' ? 'error' : 'done');
            return; // Sucesso na conexão e stream
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                
                // Se o backend enviar um evento de AGUARDANDO, mantemos o status como running
                // O backend já cuida do seu próprio loop de retry para erros internos do Playwright
                setAutomationLogs(prev => [...prev, data]);
                
                if (data.step === 'ERRO') {
                  // Se o backend desistiu após as 3 tentativas dele
                  setAutomationStatus('error');
                  return;
                } else if (data.step === 'CONCLUIDO') {
                  setAutomationStatus('done');
                  return;
                }
              } catch (e) {}
            }
          }
        }
      } catch (error: any) {
        console.error(`Falha na conexão (Tentativa ${attempt}):`, error);
        
        if (attempt < MAX_ATTEMPTS) {
          setAutomationLogs(prev => [...prev, { 
            step: 'AGUARDANDO', 
            message: `Falha de conexão: ${error.message}. Aguardando 3 minutos para tentar novamente...` 
          }]);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          setAutomationStatus('error');
          setAutomationLogs(prev => [...prev, { 
            step: 'ERRO', 
            message: `Não foi possível estabelecer conexão após ${MAX_ATTEMPTS} tentativas: ${error.message}` 
          }]);
        }
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-60px)] bg-background-main text-content-main overflow-hidden">
      {/* MENU ESQUERDO FIXO */}
      <div className="w-[240px] bg-background-secondary border-r border-border-main p-4 flex flex-col gap-2 shrink-0">
        <div className="mb-6 px-2">
          <h2 className="text-[12px] font-bold text-primary uppercase tracking-widest">
            Apoio RH
          </h2>
          <p className="text-[10px] text-content-tertiary">
            Gestão e suporte ao RH
          </p>
        </div>

        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === item.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-content-secondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <i className={`bi ${item.icon} text-[16px]`}></i>
            {item.label}
          </button>
        ))}
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'marcacoes' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* MODAL DE PROGRESSO DA AUTOMAÇÃO */}
            {automationStatus !== 'idle' && (
              <div className="absolute inset-0 z-50 bg-background-main/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 border border-border-main">
                <div className="bg-background-secondary border border-border-main w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-border-main flex justify-between items-center bg-background-main/50">
                    <h3 className="text-white font-bold text-[14px] flex items-center gap-2">
                      <i className="bi bi-robot text-primary"></i>
                      Progresso da Automação
                    </h3>
                    {automationStatus === 'error' && (
                      <button onClick={() => setAutomationStatus('idle')} className="text-content-tertiary hover:text-white">
                        <i className="bi bi-x-lg text-[14px]"></i>
                      </button>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                    {automationLogs.map((log, index) => (
                      <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          log.step === 'ERRO' ? 'bg-red-500/20 text-red-400' :
                          log.step === 'CONCLUIDO' ? 'bg-green-500/20 text-green-400' :
                          'bg-primary/20 text-primary'
                        }`}>
                          {log.step === 'ERRO' ? <i className="bi bi-exclamation-triangle-fill"></i> :
                           log.step === 'CONCLUIDO' ? <i className="bi bi-check-lg"></i> :
                           log.step}
                        </div>
                        <p className={`text-[13px] ${log.step === 'ERRO' ? 'text-red-400 font-medium' : 'text-content-secondary'}`}>
                          {log.message}
                        </p>
                      </div>
                    ))}
                    
                    {automationStatus === 'running' && (
                      <div className="flex items-center gap-2 text-[12px] text-content-tertiary mt-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        Aguardando próxima etapa...
                      </div>
                    )}
                  </div>

                  {automationStatus === 'error' && (
                    <div className="p-4 bg-red-500/10 border-t border-red-500/20 text-center">
                      <p className="text-red-400 text-[12px] font-medium">A automação encontrou um problema e foi interrompida.</p>
                      <Button onClick={() => setAutomationStatus('idle')} variant="secondary" className="mt-3 text-[12px] h-8 bg-red-500/20 text-red-300 hover:bg-red-500/30 border-none">
                        Fechar
                      </Button>
                    </div>
                  )}

                  {automationStatus === 'done' && (
                    <div className="p-4 bg-green-500/10 border-t border-green-500/20 text-center">
                      <p className="text-green-400 text-[12px] font-medium">A automação finalizou todos os passos com sucesso!</p>
                      <Button onClick={() => {
                        setAutomationStatus('idle');
                        fetchMarcacoes();
                      }} variant="secondary" className="mt-3 text-[12px] h-8 bg-green-500/20 text-green-300 hover:bg-green-500/30 border-none px-8">
                        OK
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 mb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-[20px] font-bold text-white tracking-tight">Agente de Marcações</h1>
                  <p className="text-content-secondary text-[13px]">Agente integrado ao Relógio de ponto Dimep.</p>
                </div>
                <Button 
                  onClick={handleIniciarAutomacao} 
                  disabled={automationStatus === 'running'}
                  className="flex items-center gap-2"
                >
                  {automationStatus === 'running' ? (
                    <><i className="bi bi-arrow-repeat animate-spin"></i> Processando...</>
                  ) : (
                    <><i className="bi bi-play-fill text-[18px]"></i> INICIAR AUTOMAÇÃO</>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-10 py-16">
              {/* Relógio */}
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 flex items-center justify-center">
                  <i className="bi bi-alarm text-[32px] text-content-secondary group-hover:text-primary transition-colors"></i>
                </div>
                <span className="text-[9px] font-bold text-content-tertiary uppercase tracking-widest text-center">Relógio de<br/>Ponto</span>
              </div>

              {/* Linha */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full border-t border-dashed border-border-main"></div>
              </div>

              {/* Banco */}
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 flex items-center justify-center">
                  <i className="bi bi-database text-[32px] text-content-secondary group-hover:text-primary transition-colors"></i>
                </div>
                <span className="text-[9px] font-bold text-content-tertiary uppercase tracking-widest text-center">Banco de<br/>Dados</span>
              </div>

              {/* Linha */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full border-t border-dashed border-border-main"></div>
              </div>

              {/* IA */}
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 flex items-center justify-center">
                  <i className="bi bi-robot text-[40px] text-primary drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"></i>
                </div>
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest text-center">Agente<br/>de IA</span>
              </div>

              {/* Linha */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="w-full border-t border-dashed border-border-main"></div>
              </div>

              {/* Saída */}
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-16 h-16 flex items-center justify-center">
                  <i className="bi bi-share text-[32px] text-content-secondary group-hover:text-primary transition-colors"></i>
                </div>
                <span className="text-[9px] font-bold text-content-tertiary uppercase tracking-widest text-center">Saída de<br/>Informação</span>
              </div>
            </div>

            {/* LISTAGEM DE MARCAÇÕES */}
            <div className="mt-8 bg-background-secondary border border-border-main rounded-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-6 border-b border-border-main flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background-secondary">
                <div>
                  <h2 className="text-white font-bold text-[16px] flex items-center gap-2">
                    <i className="bi bi-table text-primary"></i>
                    Marcações Extraídas
                  </h2>
                  <p className="text-content-tertiary text-[12px]">Registros sincronizados do portal Kairos.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="flex flex-col gap-1 flex-1 md:flex-none">
                    <label className="text-[9px] font-bold text-content-tertiary uppercase tracking-wider">Filtrar Data</label>
                    <input 
                      type="date" 
                      value={filtroData}
                      onChange={(e) => setFiltroData(e.target.value)}
                      className="h-9 bg-background-main border border-border-main rounded-lg px-3 text-[12px] text-content-main focus:outline-none focus:border-primary transition-colors w-full"
                    />
                  </div>
                  <Button 
                    onClick={fetchMarcacoes} 
                    variant="secondary" 
                    className="h-9 px-4 text-[12px] flex items-center gap-2 self-end"
                    disabled={loadingMarcacoes}
                  >
                    <i className={`bi bi-arrow-clockwise ${loadingMarcacoes ? 'animate-spin' : ''}`}></i>
                    <span className="hidden md:inline">Atualizar</span>
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background-main/50">
                      <th className="px-6 py-4 text-[11px] font-bold text-content-tertiary uppercase tracking-wider border-b border-border-main">Data e Hora</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-content-tertiary uppercase tracking-wider border-b border-border-main">Pessoa</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-content-tertiary uppercase tracking-wider border-b border-border-main">PIS</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-content-tertiary uppercase tracking-wider border-b border-border-main">Relógio / Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main/50">
                    {loadingMarcacoes ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[13px] text-content-tertiary">Buscando registros...</p>
                          </div>
                        </td>
                      </tr>
                    ) : marcacoes.length > 0 ? (
                      marcacoes.map((m) => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 text-[13px] text-white font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <i className="bi bi-clock text-primary/60"></i>
                              {new Date(m.data_hora).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[12px] text-content-secondary">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white/90">{m.pessoa.split('-')[1]?.trim() || m.pessoa}</span>
                              <span className="text-[10px] text-content-tertiary">{m.pessoa.split('-')[0]?.trim()}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[12px] text-content-secondary font-mono">
                            {m.pis}
                          </td>
                          <td className="px-6 py-4 text-[12px] text-content-tertiary">
                            <div className="truncate max-w-[200px]" title={m.relogio_tipo}>
                              {m.relogio_tipo}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-content-tertiary">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                              <i className="bi bi-calendar-x text-[24px]"></i>
                            </div>
                            <p className="text-[14px] font-medium text-white/60">Nenhum registro encontrado</p>
                            <p className="text-[12px] max-w-xs mx-auto">Não encontramos marcações para a data selecionada no banco de dados local.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {marcacoes.length > 0 && (
                <div className="px-6 py-4 bg-background-main/30 border-t border-border-main flex justify-between items-center">
                  <p className="text-[11px] text-content-tertiary uppercase tracking-widest font-bold">
                    Exibindo {marcacoes.length} registros
                  </p>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-green-500 font-bold uppercase">Sincronizado</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat-ia' && (
          <div className="h-full flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-[20px] font-bold text-white tracking-tight flex items-center gap-3">
                Chat IA Local
                <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">Private & Secure</span>
              </h1>
              <p className="text-content-secondary text-[12px]">Assistente inteligente treinado com as políticas internas da Regsa Metalúrgica.</p>
            </div>

            <div className="flex-1 bg-background-secondary border border-border-main rounded-2xl flex flex-col overflow-hidden mb-6">
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <i className="bi bi-robot text-white"></i>
                  </div>
                  <div className="bg-background-main border border-border-main p-4 rounded-2xl rounded-tl-none">
                    <p className="text-[13px] text-content-main leading-relaxed">
                      Olá! Sou o assistente de IA da Regsa. Como posso ajudar o RH hoje? 
                      Posso ajudar com dúvidas sobre a CLT, convenções coletivas ou políticas internas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-background-main border-t border-border-main">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Pergunte algo sobre a política de férias ou CLT..."
                    className="w-full bg-background-secondary border border-border-main rounded-xl px-4 py-3 pr-12 text-[12px] text-content-main focus:outline-none focus:border-primary transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-primary-hover transition-colors">
                    <i className="bi bi-send-fill text-[14px]"></i>
                  </button>
                </div>
                <p className="text-[10px] text-content-tertiary mt-2 text-center">
                  A IA pode cometer erros. Sempre valide informações críticas com o departamento jurídico.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'encontrar-profissional' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-10">
              <h1 className="text-[20px] font-bold text-white tracking-tight">Encontrar Profissional</h1>
              <p className="text-content-secondary text-[12px]">Busca inteligente de talentos em portais de emprego e redes profissionais.</p>
            </div>

            <div className="bg-background-secondary border border-border-main rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Cargo ou Função</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Soldador TIG, Auxiliar Administrativo..."
                    className="h-10 bg-background-main border border-border-main rounded-lg px-4 text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Departamento</label>
                  <select className="h-10 bg-background-main border border-border-main rounded-lg px-3 text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option value="">Selecione o departamento...</option>
                    <option value="producao">Produção</option>
                    <option value="adm">Administrativo</option>
                    <option value="comercial">Comercial</option>
                    <option value="logistica">Logística</option>
                    <option value="manutencao">Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Escolaridade Mínima</label>
                  <select className="h-10 bg-background-main border border-border-main rounded-lg px-3 text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option value="fundamental">Fundamental Completo</option>
                    <option value="medio">Médio Completo</option>
                    <option value="tecnico">Técnico / Profissionalizante</option>
                    <option value="superior">Ensino Superior</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Faixa Etária</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 25 - 40 anos"
                    className="h-10 bg-background-main border border-border-main rounded-lg px-4 text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Experiência Mínima</label>
                  <select className="h-10 bg-background-main border border-border-main rounded-lg px-3 text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none">
                    <option value="0">Sem experiência</option>
                    <option value="1">1 a 2 anos</option>
                    <option value="3">3 a 5 anos</option>
                    <option value="5">Mais de 5 anos</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Perfil Profissional (Palavras-chave)</label>
                <textarea 
                  placeholder="Descreva brevemente o perfil desejado, competências e habilidades específicas..."
                  className="w-full bg-background-main border border-border-main rounded-lg p-4 text-[13px] text-content-main min-h-[100px] focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" className="h-11 px-6 text-[13px]">Limpar Filtros</Button>
                <Button className="h-11 px-10 text-[13px] font-bold flex items-center gap-2">
                  <i className="bi bi-search text-[14px]"></i>
                  PESQUISAR NA REDE
                </Button>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 py-12 border-2 border-dashed border-border-main/50 rounded-3xl">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <i className="bi bi-globe text-[24px] text-content-tertiary"></i>
              </div>
              <div className="text-center">
                <h3 className="text-white font-medium text-[15px]">Pronto para buscar fora da empresa?</h3>
                <p className="text-content-tertiary text-[12px] max-w-sm mx-auto mt-1">
                  Ao clicar em pesquisar, nosso agente irá varrer sites de vagas e redes profissionais para encontrar candidatos ideais.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
