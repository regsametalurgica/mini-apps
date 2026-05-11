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
  
  const token = useAuthStore((state) => state.token);

  // Carregar usuários e apps iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [usersRes, appsRes] = await Promise.all([
          fetch('http://localhost:3000/api/admin/users', { headers }),
          fetch('http://localhost:3000/api/admin/apps', { headers })
        ]);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (appsRes.ok) setApps(await appsRes.json());
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    fetchData();
  }, [token]);

  // Buscar permissões ao selecionar um usuário
  const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    setShowSuccess(false);
    setPermissions({});

    if (userId) {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/admin/user-permissions/${userId}`, {
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

    try {
      const response = await fetch('http://localhost:3000/api/admin/user-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: selectedUser, appIds }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert('Erro ao salvar permissões');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full max-w-4xl">
      <div>
        <h2 className="text-[24px] font-semibold text-white mb-2">Aplicações e Permissões</h2>
        <p className="text-[13px] text-content-secondary">
          Vincule os usuários às aplicações que eles podem acessar no Portal de Mini Apps.
        </p>
      </div>

      <div className="bg-background-secondary border border-border-main p-8 rounded-xl flex flex-col gap-6">
        
        {/* Seleção de Usuário */}
        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-white">Selecione o Usuário</label>
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
          <>
            <div className="h-[1px] w-full bg-border-main my-2"></div>
            
            {/* Lista de Apps (Checkboxes) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] font-medium text-white">Permissões de Acesso</h3>
              {isLoading ? (
                <p className="text-content-tertiary text-[13px]">Carregando permissões...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {apps.map(app => (
                    <label 
                      key={app.id} 
                      onClick={() => handleToggleApp(app.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        permissions[app.id] 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border-main bg-background-main hover:border-border-subtle'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                        permissions[app.id] ? 'bg-primary border-primary' : 'border-content-tertiary'
                      }`}>
                        {permissions[app.id] && <i className="bi bi-check text-white text-[16px]"></i>}
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-medium ${permissions[app.id] ? 'text-white' : 'text-content-secondary'}`}>
                          {app.nome}
                        </span>
                        <span className="text-[11px] text-content-tertiary">{app.rota}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              {showSuccess ? (
                <span className="text-status-success text-[13px] font-medium flex items-center gap-2">
                  <i className="bi bi-check-circle-fill"></i>
                  Permissões salvas com sucesso!
                </span>
              ) : (
                <span></span>
              )}
              
              <Button onClick={handleSave} className="px-8" disabled={isLoading}>
                Salvar Permissões
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-content-tertiary flex flex-col items-center gap-3">
            <i className="bi bi-arrow-up-circle text-[32px]"></i>
            <p className="text-[13px]">Selecione um usuário acima para gerenciar as permissões.</p>
          </div>
        )}
      </div>

    </div>
  );
};

