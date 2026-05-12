import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../stores/authStore';

export const Login = () => {
  const navigate = useNavigate();
  const { token, user, setAuth } = useAuthStore();
  
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Se já estiver logado, redireciona para fora do login
  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [token, user, navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao realizar login');
      }

      // Salvar no Zustand e LocalStorage
      setAuth(data.token, data.user);

      // Redirecionamento baseado no Role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] p-3 rounded-md mb-2">
                  {error}
                </div>
              )}
              
              <Input 
                label="Usuário" 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="admin ou usuario"
                icon="bi-person"
                required
              />
              <Input 
                label="Senha" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="**********"
                icon="bi-key"
                required
              />
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Acessando...' : 'Acessar'}
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

