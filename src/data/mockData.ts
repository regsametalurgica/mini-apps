export const initialUsers = [
  { id: 1, name: 'André Lima', email: 'andre.lima@regsa.local', status: 'Ativo', isAdmin: true },
  { id: 2, name: 'Mariana Souza', email: 'mariana.souza@regsa.local', status: 'Ativo', isAdmin: false },
  { id: 3, name: 'Carlos Santos', email: 'carlos.santos@regsa.local', status: 'Inativo', isAdmin: false },
  { id: 4, name: 'Fernanda Rocha', email: 'fernanda.rocha@regsa.local', status: 'Ativo', isAdmin: false },
];

export const mockApps = [
  { id: 'cep', name: 'Lançamento - CEP' },
  { id: 'printers', name: 'Printers' },
  { id: 'ia', name: 'Resumo por IA' },
  { id: 'etiquetas', name: 'Gerador de Etiquetas' },
  { id: 'sobre', name: 'Sobre o App' },
];

// Funções utilitárias para simular banco de dados com localStorage
export const getUsers = () => {
  const stored = localStorage.getItem('@mini-apps:users');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('@mini-apps:users', JSON.stringify(initialUsers));
  return initialUsers;
};

export const saveUsers = (users: any[]) => {
  localStorage.setItem('@mini-apps:users', JSON.stringify(users));
};

export const getLoggedUser = () => {
  const stored = localStorage.getItem('@mini-apps:loggedUser');
  if (stored) return JSON.parse(stored);
  return null;
};

export const setLoggedUser = (user: any) => {
  if (user) {
    localStorage.setItem('@mini-apps:loggedUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('@mini-apps:loggedUser');
  }
};
