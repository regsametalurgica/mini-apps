import { useState } from 'react';
import { Button } from '../../components/ui/Button';

type MenuOption = 'marcacoes' | 'chat-ia' | 'encontrar-profissional';

export const ApoioRh = () => {
  const [activeTab, setActiveTab] = useState<MenuOption>('marcacoes');

  const menuItems = [
    { id: 'marcacoes' as MenuOption, label: 'Agente de Marcações', icon: 'bi-calendar-check' },
    { id: 'chat-ia' as MenuOption, label: 'Chat IA Local', icon: 'bi-robot' },
    { id: 'encontrar-profissional' as MenuOption, label: 'Encontrar Profissional', icon: 'bi-search' },
  ];


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
          <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1 mb-10">
              <h1 className="text-[20px] font-bold text-white tracking-tight">Agente de Marcações</h1>
              <p className="text-content-secondary text-[13px]">Agente integrado ao Relógio de ponto Dimep.</p>
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
