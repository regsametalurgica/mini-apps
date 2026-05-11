import { useState } from 'react';
import { Button } from '../../components/ui/Button';

// Mock de Usuários
const mockUsers = [
  { id: 1, name: 'André Lima' },
  { id: 2, name: 'Mariana Souza' },
  { id: 3, name: 'Carlos Santos' },
  { id: 4, name: 'Fernanda Rocha' },
];

// Mock de Apps
const mockApps = [
  { id: 'cep', name: 'Lançamento - CEP' },
  { id: 'printers', name: 'Printers' },
  { id: 'ia', name: 'Resumo por IA' },
  { id: 'etiquetas', name: 'Gerador de Etiquetas' },
  { id: 'sobre', name: 'Sobre o App' },
];

export const Applications = () => {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Simula buscar permissões de um usuário ao selecioná-lo
  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    setSelectedUser(userId || null);
    setShowSuccess(false);

    if (userId) {
      // Mock de permissões (exemplo: usuário 1 tem tudo menos IA, os outros têm apenas alguns)
      const mockPerms: Record<string, boolean> = {
        cep: true,
        printers: userId === 1 || userId === 2,
        ia: false, // Bloqueado para simular o teste do Dashboard
        etiquetas: true,
        sobre: true
      };
      setPermissions(mockPerms);
    } else {
      setPermissions({});
    }
  };

  const handleToggleApp = (appId: string) => {
    setPermissions(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
    setShowSuccess(false);
  };

  const handleSave = () => {
    // Simula salvar no backend
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
            value={selectedUser || ''}
            onChange={handleUserChange}
            className="w-full h-[42px] px-4 bg-background-main border border-border-main rounded-lg text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none"
          >
            <option value="">-- Escolha um usuário --</option>
            {mockUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        {selectedUser ? (
          <>
            <div className="h-[1px] w-full bg-border-main my-2"></div>
            
            {/* Lista de Apps (Checkboxes) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] font-medium text-white">Permissões de Acesso</h3>
              <div className="grid grid-cols-2 gap-4">
                {mockApps.map(app => (
                  <label 
                    key={app.id} 
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
                    <span className={`text-[13px] font-medium ${permissions[app.id] ? 'text-white' : 'text-content-secondary'}`}>
                      {app.name}
                    </span>
                  </label>
                ))}
              </div>
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
              
              <Button onClick={handleSave} className="px-8">
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
