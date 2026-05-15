import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';

export const Settings = () => {
  const [settings, setSettings] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_from: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/settings', {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações de SMTP salvas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar configurações.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
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
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Configurações do Sistema</h1>
        <p className="text-content-secondary text-sm">Gerencie parâmetros globais e serviços de e-mail.</p>
      </div>

      <div className="bg-background-secondary border border-border-main rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-border-main bg-background-main/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <i className="bi bi-envelope-at text-primary text-xl"></i>
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Servidor SMTP (Titan Hostgator)</h2>
            <p className="text-content-tertiary text-xs">Configure os dados de envio para os Mini Apps.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
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
              <div className="relative">
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

          {message.text && (
            <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>
              <span className="text-[13px] font-medium">{message.text}</span>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className="px-10 h-11 text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> SALVANDO...</>
              ) : (
                <><i className="bi bi-cloud-check-fill text-lg"></i> SALVAR CONFIGURAÇÕES</>
              )}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4 items-start">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <i className="bi bi-info-circle-fill text-primary"></i>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-1">Aviso de Segurança</h4>
          <p className="text-content-tertiary text-xs leading-relaxed">
            As senhas do SMTP são armazenadas de forma segura no banco de dados. 
            Certifique-se de usar uma conta dedicada para envios do sistema e habilite SSL/TLS (Porta 465) para o servidor Titan.
          </p>
        </div>
      </div>
    </div>
  );
};
