import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { getUsers, setLoggedUser } from '../data/mockData';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Buscar o usuário pelo email (simulando backend)
    const users = getUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      setLoggedUser(user);
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Se não encontrar, apenas loga com um usuário fake para não travar a UI de demonstração
      // Mas o ideal seria mostrar erro. Vamos logar como admin fake se for 'admin' ou apenas direcionar pro dashboard
      if (email.includes('admin')) {
        setLoggedUser({ name: 'Admin Temp', email, isAdmin: true, status: 'Ativo' });
        navigate('/admin');
      } else {
        setLoggedUser({ name: 'User Temp', email, isAdmin: false, status: 'Ativo' });
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-background-main text-content-main">
      {/* Sidebar de Login */}
      <div className="relative w-[500px] bg-background-secondary border-r border-border-main p-8 flex flex-col justify-center items-center shrink-0">
        <h1 className="absolute top-12 left-12 text-[28px] font-semibold leading-[1.2]">
          Welcome
        </h1>

        <div className="w-full max-w-[320px]">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Input 
                label="Usuário" 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@regsa.local"
                icon="bi-person"
              />
              <Input 
                label="Senha" 
                type="password" 
                placeholder="**********"
                icon="bi-key"
              />
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <Button type="submit" className="w-full">
                Acessar
              </Button>
              
              <a 
                href="#" 
                className="text-center text-[11px] text-content-tertiary hover:text-content-secondary transition-colors"
              >
                Esqueci a minha senha
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Main Area - Apresentação */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background-main">
        <h2 className="text-[28px] font-semibold text-content-main mb-2">
          Portal de Mini Apps
        </h2>
        <p className="text-[14px] text-content-secondary">
          Desenvolvido pela equipe de TI - Regsa Metalúrgica
        </p>
      </div>
    </div>
  );
};
