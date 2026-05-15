import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useToastStore } from '../../stores/useToastStore';

export const Applications = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const token = useAuthStore((state) => state.token);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
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

  const handleSave = async () => {
    if (!selectedUser) return;
    const appIds = Object.keys(permissions).filter(id => permissions[id]);
    const userName = users.find(u => u.id === selectedUser)?.nome || 'Usuário';
    try {
      const response = await fetch('/api/admin/user-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUser, appIds }),
      });
      if (response.ok) {
        addToast('Permissões alteradas!', 'success', `Os acessos para ${userName} foram atualizados.`);
      } else {
        addToast('Erro ao salvar!', 'error', 'Não foi possível atualizar as permissões.');
      }
    } catch (err) {
      addToast('Erro de conexão!', 'error', 'Verifique sua rede.');
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl animate-in fade-in duration-500">
      <div>
        <h2 className="text-[24px] font-bold text-white mb-2 tracking-tight">Permissões de Acesso</h2>
        <p className="text-[13px] text-content-tertiary">
          Gerencie o vínculo entre usuários e mini apps. Defina quais aplicações cada colaborador pode visualizar no dashboard.
        </p>
      </div>

      <div className="bg-background-secondary border border-border-main p-8 rounded-2xl shadow-xl flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-content-tertiary uppercase tracking-wider">Selecione o Usuário</label>
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
          <div className="flex flex-col gap-6">
            <div className="h-[1px] w-full bg-border-main"></div>
            
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] font-bold text-white">Aplicações Disponíveis</h3>
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
                      <span className={`text-[13px] font-bold ${permissions[app.id] ? 'text-white' : 'text-content-secondary'}`}>
                        {app.nome}
                      </span>
                      <span className="text-[11px] text-content-tertiary">{app.rota}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-6 border-t border-border-main">
              {showSuccess && (
                <span className="text-status-success text-[12px] font-bold flex items-center gap-2 animate-bounce">
                  <i className="bi bi-check-circle-fill"></i>
                  Permissões atualizadas!
                </span>
              )}
              <Button onClick={handleSave} className="px-10 h-11 font-bold ml-auto shadow-lg shadow-primary/20" disabled={isLoading}>
                Salvar Permissões
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-content-tertiary border-2 border-dashed border-border-main/50 rounded-2xl">
            <i className="bi bi-person-lock text-[40px] mb-4 block opacity-20"></i>
            <p className="text-[13px]">Selecione um usuário para gerenciar suas permissões de acesso.</p>
          </div>
        )}
      </div>
    </div>
  );
};
