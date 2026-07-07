import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const token = useAuthStore((state) => state.token);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao buscar usuários');
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);

  // States do CRUD
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({ 
    nome: '', 
    usuario: '', 
    matricula: '', 
    password: '', 
    role: 'user', 
    ativo: true 
  });

  // Filtro
  const filteredUsers = users.filter(user => 
    (user.nome?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.usuario?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Ações
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ nome: '', usuario: '', matricula: '', password: '', role: 'user', ativo: true });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ 
      nome: user.nome, 
      usuario: user.usuario, 
      matricula: user.matricula || '', 
      password: '', // Senha em branco por padrão na edição
      role: user.role, 
      ativo: user.ativo 
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingUser;
      const url = isEditing 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao salvar usuário');
      }

      await fetchUsers();
      setIsFormModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir usuário');
      }

      await fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isAdminDefault = editingUser?.usuario === 'admin';

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Top Actions ... (mantido igual) */}
      <div className="flex justify-end items-end">
        <div className="flex items-center gap-4">
          <div className="relative">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary"></i>
            <input 
              type="text" 
              placeholder="Buscar usuário..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[38px] w-[260px] bg-background-secondary border border-border-main rounded-[999px] pl-10 pr-4 text-[13px] text-content-main placeholder:text-content-tertiary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <Button onClick={openCreateModal} className="h-[38px] px-6">
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Table List */}
      <div className="flex-1 bg-background-secondary border border-border-main rounded-xl overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-main bg-background-tertiary text-[12px] font-semibold text-content-tertiary uppercase tracking-wider">
          <div className="col-span-3">Nome</div>
          <div className="col-span-3">Usuário</div>
          <div className="col-span-2">Matrícula</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-content-tertiary text-[14px]">Carregando...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-content-tertiary text-[14px]">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-main items-center hover:bg-background-main transition-colors">
                <div className="col-span-3 text-[14px] text-content-main font-medium truncate flex items-center gap-2">
                  {user.nome}
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                      Admin
                    </span>
                  )}
                </div>
                <div className="col-span-3 text-[14px] text-content-secondary truncate">
                  {user.usuario}
                </div>
                <div className="col-span-2 text-[14px] text-content-secondary">
                  {user.matricula || '-'}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${
                    user.ativo 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-status-error/10 text-status-error'
                  }`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="w-8 h-8 rounded-md bg-background-card border border-border-main flex items-center justify-center text-content-secondary hover:text-content-main hover:border-border-subtle transition-all"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    onClick={() => openDeleteModal(user.id)}
                    className="w-8 h-8 rounded-md bg-background-card border border-border-main flex items-center justify-center text-status-error hover:bg-status-error/10 hover:border-status-error/30 transition-all"
                    disabled={user.usuario === 'admin'}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal (Create/Edit) */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}>
        <h3 className="text-[18px] font-semibold text-content-main mb-6">
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Nome Completo"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: João da Silva"
              required
              disabled={isAdminDefault}
            />
            <Input 
              label="Matrícula"
              type="number"
              value={formData.matricula}
              onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
              placeholder="0000"
              disabled={isAdminDefault}
            />
          </div>
          <Input 
            label="Usuário"
            value={formData.usuario}
            onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
            placeholder="nome.sobrenome"
            required
            disabled={isAdminDefault}
          />
          <Input 
            label={editingUser ? "Nova Senha (deixe em branco para manter)" : "Senha Inicial"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="********"
            required={!editingUser}
          />
          {!isAdminDefault && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-content-secondary">Cargo / Nível</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-4 bg-background-main border border-border-main rounded-lg text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-content-secondary">Status</label>
                <select 
                  value={formData.ativo ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                  className="w-full h-10 px-4 bg-background-main border border-border-main rounded-lg text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </>
          )}
          
          <div className="flex gap-3 mt-4">
            <Button 
              type="button" 
              onClick={() => setIsFormModalOpen(false)}
              className="flex-1 !bg-background-card hover:!bg-background-tertiary !text-content-main border border-border-main"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="flex flex-col items-center text-center py-2">
          <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mb-4">
            <i className="bi bi-exclamation-triangle text-[32px] text-status-error"></i>
          </div>
          <h3 className="text-[18px] font-semibold text-content-main mb-2">Excluir Usuário</h3>
          <p className="text-[14px] text-content-secondary mb-8">
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              type="button" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 !bg-background-card hover:!bg-background-tertiary !text-content-main border border-border-main"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              className="flex-1 !bg-status-error hover:!bg-red-600 !text-content-main"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


