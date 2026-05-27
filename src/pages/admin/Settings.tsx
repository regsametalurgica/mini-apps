import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/useToastStore';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'apps'>('general');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [appForm, setAppForm] = useState({ 
    email: '', 
    enabled: false,
    cep_endpoint_load: '',
    cep_endpoint_register: '',
    cep_api_user: '',
    cep_api_password: ''
  });
  const [apps, setApps] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = useAuthStore((state) => state.token);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchGeneralSettings();
    fetchApps();
  }, []);

  const fetchGeneralSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApps = async () => {
    try {
      const response = await fetch('/api/admin/apps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setApps(await response.json());
      }
    } catch (err) {}
  };

  const handleSelectApp = (app: any) => {
    setSelectedApp(app);
    setAppForm({
      email: app.email_notificacao || '',
      enabled: app.notificar_por_email || false,
      cep_endpoint_load: app.cep_endpoint_load || '',
      cep_endpoint_register: app.cep_endpoint_register || '',
      cep_api_user: app.cep_api_user || '',
      cep_api_password: app.cep_api_password || ''
    });
  };

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        addToast('Configuração alterada!', 'success', 'Os dados do servidor SMTP foram atualizados com sucesso.');
      } else {
        addToast('Erro ao salvar!', 'error', 'Não foi possível atualizar as configurações de SMTP.');
      }
    } catch (error) {
      addToast('Erro de conexão!', 'error', 'Verifique sua rede e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppConfig = async () => {
    if (!selectedApp) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/apps/${selectedApp.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          notificar_por_email: appForm.enabled, 
          email_notificacao: appForm.email,
          cep_endpoint_load: appForm.cep_endpoint_load,
          cep_endpoint_register: appForm.cep_endpoint_register,
          cep_api_user: appForm.cep_api_user,
          cep_api_password: appForm.cep_api_password
        }),
      });
      
      if (response.ok) {
        addToast('Configuração salva!', 'success', `As configurações do app ${selectedApp.nome} foram atualizadas.`);
        // Atualiza a lista local
        setApps(apps.map(a => a.id === selectedApp.id ? { 
          ...a, 
          notificar_por_email: appForm.enabled, 
          email_notificacao: appForm.email,
          cep_endpoint_load: appForm.cep_endpoint_load,
          cep_endpoint_register: appForm.cep_endpoint_register,
          cep_api_user: appForm.cep_api_user,
          cep_api_password: appForm.cep_api_password
        } : a));
        // Retorna para a lista (melhor experiência como pedido)
        setSelectedApp(null);
      } else {
        addToast('Erro ao salvar!', 'error', 'Houve um problema ao salvar as configurações.');
      }
    } catch (err) {
      addToast('Erro de conexão!', 'error', 'Houve um problema de rede.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full max-w-6xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-[24px] font-bold text-white mb-2 tracking-tight">Configurações</h2>
        <p className="text-[13px] text-content-tertiary">Gerencie parâmetros globais e comportamentos específicos dos mini apps.</p>
      </div>

      <div className="flex gap-2 p-1 bg-background-secondary border border-border-main rounded-xl w-fit">
        <button 
          onClick={() => { setActiveTab('general'); setSelectedApp(null); }}
          className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-content-tertiary hover:text-white'}`}
        >
          <i className="bi bi-gear-wide-connected mr-2"></i> Configurações Gerais
        </button>
        <button 
          onClick={() => setActiveTab('apps')}
          className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all ${activeTab === 'apps' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-content-tertiary hover:text-white'}`}
        >
          <i className="bi bi-cpu mr-2"></i> Configurações de Mini Apps
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Lado Esquerdo (Lista de Apps) */}
        {activeTab === 'apps' && (
          <div className="lg:col-span-1 bg-background-secondary border border-border-main rounded-2xl p-4 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-content-tertiary uppercase tracking-widest px-2 mb-2">Selecione o Aplicativo</label>
            {apps.map(app => (
              <button 
                key={app.id}
                onClick={() => handleSelectApp(app)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedApp?.id === app.id ? 'bg-primary/10 text-primary border border-primary/20' : 'text-content-secondary hover:bg-background-main hover:text-white border border-transparent'}`}
              >
                <i className={`bi ${app.icone || 'bi-app'} text-lg`}></i>
                <span className="text-[12px] font-bold truncate">{app.nome}</span>
              </button>
            ))}
          </div>
        )}

        {/* Lado Direito (Conteúdo Principal) */}
        <div className={`${activeTab === 'apps' ? 'lg:col-span-3' : 'lg:col-span-4'} bg-background-secondary border border-border-main rounded-2xl shadow-xl flex flex-col`}>
          
          {activeTab === 'general' ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-border-main bg-background-main/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <i className="bi bi-envelope-at text-primary text-xl"></i>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Servidor SMTP</h3>
                  <p className="text-content-tertiary text-[11px]">Configuração global para disparo de e-mails.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSMTP} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Host SMTP</label>
                    <input 
                      type="text" 
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({...settings, smtp_host: e.target.value})}
                      placeholder="ex: smtp.titan.email"
                      className="w-full h-10 bg-background-main border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Porta SMTP</label>
                    <input 
                      type="text" 
                      value={settings.smtp_port}
                      onChange={(e) => setSettings({...settings, smtp_port: e.target.value})}
                      placeholder="465 ou 587"
                      className="w-full h-10 bg-background-main border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Usuário (E-mail)</label>
                    <input 
                      type="email" 
                      value={settings.smtp_user}
                      onChange={(e) => setSettings({...settings, smtp_user: e.target.value})}
                      placeholder="email@regsa.com.br"
                      className="w-full h-10 bg-background-main border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Senha SMTP</label>
                    <input 
                      type="password" 
                      value={settings.smtp_pass}
                      onChange={(e) => setSettings({...settings, smtp_pass: e.target.value})}
                      placeholder="••••••••"
                      className="w-full h-10 bg-background-main border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">E-mail de Remetente (From)</label>
                  <input 
                    type="email" 
                    value={settings.smtp_from}
                    onChange={(e) => setSettings({...settings, smtp_from: e.target.value})}
                    placeholder="Não responder <email@regsa.com.br>"
                    className="w-full h-10 bg-background-main border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={saving} className="px-10 h-11 text-sm font-bold shadow-lg shadow-primary/20">
                    {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {selectedApp ? (
                <div className="flex flex-col">
                  <div className="p-6 border-b border-border-main bg-background-main/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <i className={`bi ${selectedApp.icone || 'bi-app'} text-primary text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm">{selectedApp.nome}</h3>
                        <p className="text-content-tertiary text-[11px]">Configurações específicas desta funcionalidade.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedApp(null)}
                      className="text-[12px] text-content-tertiary hover:text-white flex items-center gap-2"
                    >
                      <i className="bi bi-arrow-left"></i> Voltar à lista
                    </button>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="bg-background-main/50 border border-border-main p-6 rounded-2xl flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-white font-bold text-sm">Notificações Automáticas</h4>
                          <p className="text-content-tertiary text-[11px]">Enviar e-mail automático após a conclusão dos processos deste app.</p>
                        </div>
                        <button 
                          onClick={() => setAppForm({ ...appForm, enabled: !appForm.enabled })}
                          className={`h-10 px-6 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${
                            appForm.enabled 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' 
                              : 'bg-background-secondary text-content-tertiary border border-border-main hover:bg-background-main'
                          }`}
                        >
                          <i className={`bi ${appForm.enabled ? 'bi-toggle-on' : 'bi-toggle-off'} text-lg`}></i>
                          {appForm.enabled ? 'ATIVADO' : 'DESATIVADO'}
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Destinatário (Email)</label>
                        <input 
                          type="email" 
                          placeholder="exemplo@regsa.com.br"
                          value={appForm.email}
                          onChange={(e) => setAppForm({ ...appForm, email: e.target.value })}
                          className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <Button 
                          onClick={handleSaveAppConfig} 
                          disabled={saving}
                          className="h-10 px-10 font-bold shadow-lg shadow-primary/20"
                        >
                          {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÃO'}
                        </Button>
                      </div>
                    </div>

                    {selectedApp.rota === '/apps/cep' && (
                      <div className="bg-background-main/50 border border-border-main p-6 rounded-2xl flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-white font-bold text-sm">Integração API TOTVS / Endpoint</h4>
                          <p className="text-content-tertiary text-[11px]">Endereços dos serviços de integração para o Controle Estatístico de Processo.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Carregamento (Load)</label>
                          <input 
                            type="text" 
                            placeholder="ex: http://protheus:8084/rest/api/cep/load"
                            value={appForm.cep_endpoint_load || ''}
                            onChange={(e) => setAppForm({ ...appForm, cep_endpoint_load: e.target.value })}
                            className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Registro (Register)</label>
                          <input 
                            type="text" 
                            placeholder="ex: http://protheus:8084/rest/api/cep/register"
                            value={appForm.cep_endpoint_register || ''}
                            onChange={(e) => setAppForm({ ...appForm, cep_endpoint_register: e.target.value })}
                            className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Usuário API (Basic Auth)</label>
                            <input 
                              type="text" 
                              placeholder="ex: admin"
                              value={appForm.cep_api_user || ''}
                              onChange={(e) => setAppForm({ ...appForm, cep_api_user: e.target.value })}
                              className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Senha API</label>
                            <input 
                              type="password" 
                              placeholder="••••••••"
                              value={appForm.cep_api_password || ''}
                              onChange={(e) => setAppForm({ ...appForm, cep_api_password: e.target.value })}
                              className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Button 
                            onClick={handleSaveAppConfig} 
                            disabled={saving}
                            className="h-10 px-10 font-bold shadow-lg shadow-primary/20"
                          >
                            {saving ? 'SALVANDO...' : 'SALVAR ENDPOINTS'}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3">
                      <i className="bi bi-info-circle text-primary"></i>
                      <p className="text-[11px] text-content-tertiary leading-relaxed">
                        Estas configurações são aplicadas em tempo real. Os Mini Apps que possuem automação (como o <b>Apoio RH</b>) utilizarão esses dados para disparo imediato.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-content-tertiary py-20">
                  <div className="w-16 h-16 rounded-full bg-background-main flex items-center justify-center mb-6 border border-border-main shadow-inner">
                    <i className="bi bi-cpu text-[32px] opacity-20"></i>
                  </div>
                  <h3 className="text-white font-bold text-sm mb-1">Selecione um Aplicativo</h3>
                  <p className="text-[12px] opacity-60">Escolha um app à esquerda para gerenciar notificações e parâmetros.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
