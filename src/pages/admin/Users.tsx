import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { getUsers, saveUsers } from '../../data/mockData';

export const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Carregar usuários do localStorage na montagem
  useEffect(() => {
    setUsers(getUsers());
  }, []);

  // States do CRUD
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', status: 'Ativo', isAdmin: false });

  // Filtro
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ações
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', status: 'Ativo', isAdmin: false });
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, status: user.status, isAdmin: !!user.isAdmin });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedUsers;
    if (editingUser) {
      updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
    } else {
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      updatedUsers = [...users, { id: newId, ...formData }];
    }
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setIsFormModalOpen(false);
  };

  const handleDelete = () => {
    if (userToDelete) {
      const updatedUsers = users.filter(u => u.id !== userToDelete);
      setUsers(updatedUsers);
      saveUsers(updatedUsers);
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Top Actions */}
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
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-main bg-[#161616] text-[12px] font-semibold text-content-tertiary uppercase tracking-wider">
          <div className="col-span-4">Nome</div>
          <div className="col-span-4">E-mail</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-content-tertiary text-[14px]">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border-main items-center hover:bg-[#1A1A1A] transition-colors">
                <div className="col-span-4 text-[14px] text-content-main font-medium truncate flex items-center gap-2">
                  {user.name}
                  {user.isAdmin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20">
                      Admin
                    </span>
                  )}
                </div>
                <div className="col-span-4 text-[14px] text-content-secondary truncate">
                  {user.email}
                </div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium ${
                    user.status === 'Ativo' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-status-error/10 text-status-error'
                  }`}>
                    {user.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <button 
                    onClick={() => openEditModal(user)}
                    className="w-8 h-8 rounded-md bg-background-card border border-border-main flex items-center justify-center text-content-secondary hover:text-white hover:border-border-subtle transition-all"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button 
                    onClick={() => openDeleteModal(user.id)}
                    className="w-8 h-8 rounded-md bg-background-card border border-border-main flex items-center justify-center text-status-error hover:bg-status-error/10 hover:border-status-error/30 transition-all"
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
        <h3 className="text-[18px] font-semibold text-white mb-6">
          {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input 
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: João da Silva"
            required
          />
          <Input 
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="joao@regsa.local"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-content-secondary">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 px-4 bg-background-main border border-border-main rounded-lg text-[13px] text-content-main focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          
          <label className="flex items-center gap-3 mt-2 p-3 bg-background-main border border-border-main rounded-lg cursor-pointer hover:border-border-subtle transition-colors">
            <input 
              type="checkbox" 
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
              className="w-4 h-4 rounded bg-background-secondary border-border-main text-primary focus:ring-primary focus:ring-offset-background-main"
            />
            <div className="flex flex-col">
              <span className="text-[13px] text-content-main font-medium">Tornar esse usuário administrador</span>
              <span className="text-[11px] text-content-secondary">Administradores têm acesso a todos os aplicativos automaticamente.</span>
            </div>
          </label>
          <div className="flex gap-3 mt-4">
            <Button 
              type="button" 
              onClick={() => setIsFormModalOpen(false)}
              className="flex-1 !bg-background-card hover:!bg-[#2A2A2A] !text-white border border-border-main"
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
          <h3 className="text-[18px] font-semibold text-white mb-2">Excluir Usuário</h3>
          <p className="text-[14px] text-content-secondary mb-8">
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              type="button" 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 !bg-background-card hover:!bg-[#2A2A2A] !text-white border border-border-main"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleDelete}
              className="flex-1 !bg-status-error hover:!bg-red-600 !text-white"
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
