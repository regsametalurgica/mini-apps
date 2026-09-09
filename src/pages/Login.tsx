import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        navigate('/');
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
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F4F5F7] text-content-main p-6">
      <div className="w-full max-w-[360px] flex flex-col items-center">
        
        {/* Simulação do Logo TOTVS */}
        <div className="flex items-center gap-2 mb-6">
          <i className="bi bi-layers-half text-[32px] text-[#4A4A4A]"></i>
          <span className="text-[28px] font-bold text-[#4A4A4A] tracking-tight">REGSA</span>
        </div>

        <h1 className="text-[26px] font-light text-[#4A4A4A] mb-4">
          Integração Protheus ERP
        </h1>
        
        <h2 className="text-[18px] text-primary mb-8 font-medium">
          Controle Estatístico CEP
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] p-3 rounded-md text-center font-medium">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold text-[#333]">Insira seu usuário</label>
            <div className="relative">
              <i className="bi bi-person absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-primary"></i>
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ex. admin"
                className="w-full h-[42px] pl-10 pr-4 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-content-main focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold text-[#333]">Insira sua senha</label>
            <div className="relative">
              <i className="bi bi-unlock absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-primary"></i>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[42px] pl-10 pr-4 bg-white border border-[#D1D5DB] rounded-md text-[14px] text-content-main focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-[42px] rounded-md font-bold text-[14px] transition-colors mt-2 ${
              usuario && password 
                ? 'bg-primary text-white hover:bg-primary/90' 
                : 'bg-[#B0B0B0] text-white cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <div className="text-center mt-4">
            <a 
              href="#" 
              className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

