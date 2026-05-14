import { useState } from 'react';
import { Button } from '../../components/ui/Button';

type MenuOption = 'marcacoes' | 'chat-ia';

export const ApoioRh = () => {
  const [activeTab, setActiveTab] = useState<MenuOption>('marcacoes');

  const menuItems = [
    { id: 'marcacoes' as MenuOption, label: 'Agente de Marcações', icon: 'bi-calendar-check' },
    { id: 'chat-ia' as MenuOption, label: 'Chat IA Local', icon: 'bi-robot' },
  ];

  return (
    <div className="flex h-full bg-background-main text-content-main overflow-hidden">
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

        <div className="mt-auto p-4 bg-background-main/50 rounded-xl border border-border-main/50">
          <div className="flex items-center gap-2 mb-2">
            <i className="bi bi-info-circle text-primary"></i>
            <span className="text-[11px] font-bold text-content-secondary uppercase">Status do Sistema</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse"></div>
            <span className="text-[11px] text-content-tertiary">Servidores Online</span>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'marcacoes' && (
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="text-[28px] font-bold text-white tracking-tight">Agente de Marcações</h1>
              <p className="text-content-secondary text-[14px]">Gerencie e audite as marcações de ponto dos colaboradores.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background-secondary border border-border-main rounded-2xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="bi bi-upload text-primary text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Importar Arquivo AFD</h3>
                <p className="text-sm text-content-tertiary">Envie os arquivos de marcações do relógio de ponto para análise automática.</p>
              </div>

              <div className="bg-background-secondary border border-border-main rounded-2xl p-6 hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="bi bi-file-earmark-spreadsheet text-green-500 text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Relatório de Inconsistências</h3>
                <p className="text-sm text-content-tertiary">Gere um relatório detalhado de faltas, atrasos e horas extras detectadas.</p>
              </div>
            </div>

            <div className="mt-8 bg-background-secondary border border-border-main rounded-2xl p-8 flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <i className="bi bi-clock-history text-3xl text-content-tertiary"></i>
              </div>
              <h2 className="text-xl font-medium text-white mb-2">Nenhuma atividade recente</h2>
              <p className="text-content-tertiary max-w-sm">
                As marcações processadas aparecerão aqui após a importação do primeiro arquivo AFD.
              </p>
              <Button className="mt-6" variant="outline">
                Configurar Agente
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'chat-ia' && (
          <div className="h-full flex flex-col max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-6">
              <h1 className="text-[28px] font-bold text-white tracking-tight flex items-center gap-3">
                Chat IA Local
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/20">Private & Secure</span>
              </h1>
              <p className="text-content-secondary text-[14px]">Assistente inteligente treinado com as políticas internas da Regsa Metalúrgica.</p>
            </div>

            <div className="flex-1 bg-background-secondary border border-border-main rounded-2xl flex flex-col overflow-hidden mb-6">
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                    <i className="bi bi-robot text-white"></i>
                  </div>
                  <div className="bg-background-main border border-border-main p-4 rounded-2xl rounded-tl-none">
                    <p className="text-[14px] text-content-main leading-relaxed">
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
                    className="w-full bg-background-secondary border border-border-main rounded-xl px-4 py-3 pr-12 text-[14px] text-content-main focus:outline-none focus:border-primary transition-colors"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-primary-hover transition-colors">
                    <i className="bi bi-send-fill text-[14px]"></i>
                  </button>
                </div>
                <p className="text-[11px] text-content-tertiary mt-2 text-center">
                  A IA pode cometer erros. Sempre valide informações críticas com o departamento jurídico.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
