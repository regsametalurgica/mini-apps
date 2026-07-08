import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface ErpConfigStatus {
  configurado: boolean;
  protheus_api_url: string | null;
  endpoint_load: string | null;
  endpoint_register: string | null;
  api_user: string | null;
  api_password: string | null;
  fonte: string;
}

export const Settings = () => {
  const [config, setConfig] = useState<ErpConfigStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  const fetchErpConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/erp-config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setError('Não foi possível carregar o status da integração.');
      }
    } catch (err) {
      console.error('[Settings] Erro ao carregar configurações do Protheus:', err);
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchErpConfig();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchErpConfig]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <i className="bi bi-exclamation-triangle text-4xl text-red-400"></i>
        <p className="text-content-tertiary text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-[24px] font-bold text-content-main mb-2 tracking-tight">Integração ERP Protheus</h2>
        <p className="text-[13px] text-content-tertiary">Status da integração com o ERP Protheus para o Controle Estatístico de Processo.</p>
      </div>

      {/* Status Geral */}
      <div className="bg-background-secondary border border-border-main rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border-main bg-background-main/30 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config?.configurado ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
            <i className={`bi ${config?.configurado ? 'bi-check-circle-fill text-green-500' : 'bi-exclamation-triangle-fill text-amber-500'} text-xl`}></i>
          </div>
          <div>
            <h3 className="text-content-main font-bold text-sm">
              {config?.configurado ? 'Integração Configurada' : 'Integração Não Configurada'}
            </h3>
            <p className="text-content-tertiary text-[11px]">
              Fonte: {config?.fonte}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6 bg-background-main/50">
          {/* URL Base */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">URL Base do Protheus</label>
            <div className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 flex items-center text-sm text-content-main/70">
              <i className="bi bi-link-45deg mr-2 text-primary/60"></i>
              {config?.protheus_api_url || <span className="text-content-tertiary italic">Não configurado</span>}
            </div>
          </div>

          {/* Endpoints */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Carregamento (Load)</label>
            <div className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 flex items-center text-sm text-content-main/70">
              <i className="bi bi-download mr-2 text-primary/60"></i>
              {config?.endpoint_load || <span className="text-content-tertiary italic">Não configurado</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Endpoint de Registro (Register)</label>
            <div className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 flex items-center text-sm text-content-main/70">
              <i className="bi bi-upload mr-2 text-primary/60"></i>
              {config?.endpoint_register || <span className="text-content-tertiary italic">Não configurado</span>}
            </div>
          </div>

          {/* Credenciais (mascaradas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Usuário API (Basic Auth)</label>
              <div className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 flex items-center text-sm text-content-main/70">
                <i className="bi bi-person-lock mr-2 text-primary/60"></i>
                {config?.api_user || <span className="text-content-tertiary italic">Não configurado</span>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Senha API</label>
              <div className="w-full h-10 bg-background-secondary border border-border-main rounded-lg px-4 flex items-center text-sm text-content-main/70">
                <i className="bi bi-shield-lock mr-2 text-primary/60"></i>
                {config?.api_password || <span className="text-content-tertiary italic">Não configurado</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso informativo */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <i className="bi bi-info-circle text-blue-400 text-xl"></i>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-content-main font-bold text-sm">Como alterar as credenciais?</h4>
          <p className="text-content-tertiary text-[12px] leading-relaxed">
            As credenciais de integração com o ERP Protheus são gerenciadas exclusivamente pelo arquivo 
            <code className="mx-1 px-2 py-0.5 bg-background-secondary border border-border-main rounded text-primary font-mono text-[11px]">.env</code> 
            na raiz do servidor. Para alterar os endpoints ou credenciais de autenticação, edite as seguintes variáveis:
          </p>
          <div className="mt-2 bg-background-secondary border border-border-main rounded-xl p-4 font-mono text-[11px] text-content-main/70 space-y-1">
            <div><span className="text-primary">PROTHEUS_API_URL</span>=http://protheus:8084/rest</div>
            <div><span className="text-primary">PROTHEUS_API_USER</span>=seu_usuario</div>
            <div><span className="text-primary">PROTHEUS_API_PASSWORD</span>=sua_senha</div>
            <div><span className="text-primary">PROTHEUS_ENDPOINT_CEP_LOAD</span>=http://protheus:8084/rest/api/cep/load</div>
            <div><span className="text-primary">PROTHEUS_ENDPOINT_CEP_REGISTER</span>=http://protheus:8084/rest/api/cep/register</div>
          </div>
          <p className="text-amber-400/80 text-[11px] mt-1">
            <i className="bi bi-exclamation-triangle mr-1"></i>
            Após alterar o arquivo <code className="px-1 py-0.5 bg-background-secondary border border-border-main rounded text-primary font-mono text-[10px]">.env</code>, reinicie o servidor para aplicar as mudanças.
          </p>
        </div>
      </div>
    </div>
  );
};
