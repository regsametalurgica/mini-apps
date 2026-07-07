import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/useToastStore';

export const Settings = () => {
  const [cepAppId, setCepAppId] = useState<number | null>(null);
  const [appForm, setAppForm] = useState({ 
    cep_endpoint_load: '',
    cep_endpoint_register: '',
    cep_api_user: '',
    cep_api_password: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = useAuthStore((state) => state.token);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    fetchAppConfig();
  }, []);

  const fetchAppConfig = async () => {
    try {
      const response = await fetch('/api/admin/apps', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const apps = await response.json();
        const cepApp = apps[0]; // Como refatoramos, só tem 1 app
        if (cepApp) {
          setCepAppId(cepApp.id);
          setAppForm({
            cep_endpoint_load: cepApp.cep_endpoint_load || '',
            cep_endpoint_register: cepApp.cep_endpoint_register || '',
            cep_api_user: cepApp.cep_api_user || '',
            cep_api_password: cepApp.cep_api_password || ''
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar app:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAppConfig = async () => {
    if (!cepAppId) return;
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/apps/${cepAppId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          notificar_por_email: false, 
          email_notificacao: '',
          cep_endpoint_load: appForm.cep_endpoint_load,
          cep_endpoint_register: appForm.cep_endpoint_register,
          cep_api_user: appForm.cep_api_user,
          cep_api_password: appForm.cep_api_password
        }),
      });
      
      if (response.ok) {
        addToast('Configuração salva!', 'success', `As configurações do ERP Protheus foram atualizadas.`);
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
    <div className="flex flex-col gap-6 h-full max-w-4xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-[24px] font-bold text-content-main mb-2 tracking-tight">Integração ERP Protheus</h2>
        <p className="text-[13px] text-content-tertiary">Gerencie os endpoints e credenciais da API do Protheus para o Controle Estatístico de Processo.</p>
      </div>

      <div className="bg-background-secondary border border-border-main rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-main bg-background-main/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <i className="bi bi-server text-primary text-xl"></i>
          </div>
          <div>
            <h3 className="text-content-main font-bold text-sm">Endpoints da API REST</h3>
            <p className="text-content-tertiary text-[11px]">Configurações exclusivas do App CEP.</p>
          </div>
        </div>

        <div className="p-8 space-y-8 bg-background-main/50">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Carregamento (Load)</label>
            <input 
              type="text" 
              placeholder="ex: http://protheus:8084/rest/api/cep/load"
              value={appForm.cep_endpoint_load}
              onChange={(e) => setAppForm({ ...appForm, cep_endpoint_load: e.target.value })}
              className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Registro (Register)</label>
            <input 
              type="text" 
              placeholder="ex: http://protheus:8084/rest/api/cep/register"
              value={appForm.cep_endpoint_register}
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
                value={appForm.cep_api_user}
                onChange={(e) => setAppForm({ ...appForm, cep_api_user: e.target.value })}
                className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 text-sm text-content-main focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Senha API</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={appForm.cep_api_password}
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
      </div>
    </div>
  );
};
