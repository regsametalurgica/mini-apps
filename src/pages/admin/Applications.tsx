import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export const Applications = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'permissions' | 'notifications'>('permissions');
  
  const token = useAuthStore((state) => state.token);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [usersRes, appsRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/apps', { headers })
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (appsRes.ok) setApps(await appsRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    setShowSuccess(false);
    setPermissions({});

    if (userId) {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/admin/user-permissions/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userAppIds: string[] = await response.json();
          const permsObj: Record<string, boolean> = {};
          userAppIds.forEach(id => permsObj[id] = true);
          setPermissions(permsObj);
        }
      } catch (err) {
        console.error('Erro ao buscar permissões:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleApp = (appId: string) => {
    setPermissions(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
    setShowSuccess(false);
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    const appIds = Object.keys(permissions).filter(id => permissions[id]);
    try {
      const response = await fetch('/api/admin/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUser, appIds }),
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  const handleUpdateEmailSetting = async (appId: string, enabled: boolean, email: string) => {
    try {
      const response = await fetch(`/api/admin/apps/${appId}/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ notificar_por_email: enabled, email_notificacao: email }),
      });
      if (response.ok) {
        fetchData();
        alert('Configurações salvas!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl">
      <div>
        <h2 className="text-[24px] font-bold text-white mb-2 tracking-tight">Gestão de Aplicações</h2>
        <p className="text-[13px] text-content-tertiary">Controle permissões de acesso e notificações de e-mail por mini app.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-background-secondary border border-border-main rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all ${activeTab === 'permissions' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-content-tertiary hover:text-white'}`}
        >
          <i className="bi bi-shield-lock mr-2"></i> Permissões de Usuário
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-2 rounded-lg text-[12px] font-bold transition-all ${activeTab === 'notifications' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-content-tertiary hover:text-white'}`}
        >
          <i className="bi bi-bell mr-2"></i> Notificações por E-mail
        </button>
      </div>

      <div className="bg-background-secondary border border-border-main p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        {activeTab === 'permissions' ? (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Selecione o Usuário para Auditar</label>
              <select 
                value={selectedUser}
                onChange={handleUserChange}
                className="w-full h-[42px] px-4 bg-background-main border border-border-main rounded-lg text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="">-- Escolha um usuário --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                ))}
              </select>
            </div>

            {selectedUser ? (
              <div className="animate-in fade-in duration-500 flex flex-col gap-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {apps.map(app => (
                    <label 
                      key={app.id} 
                      onClick={() => handleToggleApp(app.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        permissions[app.id] 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-border-main bg-background-main hover:border-border-subtle'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        permissions[app.id] ? 'bg-primary border-primary' : 'border-border-main'
                      }`}>
                        {permissions[app.id] && <i className="bi bi-check-lg text-white text-[14px]"></i>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-bold ${permissions[app.id] ? 'text-white' : 'text-content-secondary'}`}>{app.nome}</span>
                        <span className="text-[11px] text-content-tertiary">{app.rota}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-main">
                  {showSuccess && <span className="text-status-success text-[12px] font-bold flex items-center gap-2 animate-bounce"><i className="bi bi-check-circle-fill"></i> Salvo!</span>}
                  <Button onClick={handleSavePermissions} className="px-10 h-11 font-bold ml-auto shadow-lg shadow-primary/20" disabled={isLoading}>Salvar Permissões</Button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-content-tertiary border-2 border-dashed border-border-main/50 rounded-2xl">
                <i className="bi bi-person-check text-[32px] mb-2 block"></i>
                <p className="text-[13px]">Selecione um usuário para gerenciar seus acessos.</p>
              </div>
            )}
          </>
        ) : (
          <div className="animate-in fade-in duration-500 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {apps.map(app => (
                <div key={app.id} className="p-6 bg-background-main border border-border-main rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <i className={`bi ${app.icone || 'bi-app'} text-xl text-primary`}></i>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-bold text-sm">{app.nome}</span>
                      <span className="text-[11px] text-content-tertiary uppercase tracking-widest">{app.id}</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex flex-col gap-1 w-full md:w-auto">
                      <label className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">Email para Notificação</label>
                      <input 
                        type="email" 
                        defaultValue={app.email_notificacao || ''}
                        onBlur={(e) => handleUpdateEmailSetting(app.id, app.notificar_por_email, e.target.value)}
                        placeholder="destinatario@regsa.com.br"
                        className="h-9 bg-background-secondary border border-border-main rounded-lg px-3 text-[12px] text-content-main focus:outline-none focus:border-primary transition-colors md:w-[250px]"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1 w-full md:w-auto items-start">
                      <label className="text-[10px] font-bold text-content-tertiary uppercase tracking-wider">Status Email</label>
                      <button 
                        onClick={() => handleUpdateEmailSetting(app.id, !app.notificar_por_email, app.email_notificacao)}
                        className={`h-9 px-4 rounded-lg text-[11px] font-bold transition-all flex items-center gap-2 w-full justify-center md:w-auto ${
                          app.notificar_por_email 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        <i className={`bi ${app.notificar_por_email ? 'bi-toggle-on' : 'bi-toggle-off'} text-lg`}></i>
                        {app.notificar_por_email ? 'ATIVADO' : 'DESATIVADO'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
