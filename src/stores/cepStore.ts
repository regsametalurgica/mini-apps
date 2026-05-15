import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface CepLimits {
  lsc: number;
  media: number;
  lic: number;
}

interface CepData {
  op: string;
  numeroCarta: string;
  cp: number;
  cpk: number;
  numeroPeca: string;
  equipamento: string;
  caracteristica: string;
  sequencia: string;
  revisaoFicha: string;
  setor: string;
  especificacao: string;
  cliente: string;
  tamanhoAmostra: number;
  frequencia: string;
  limitesControle: {
    xbar: CepLimits;
    range: CepLimits;
  };
  historico: {
    xbar: number[];
    range: number[];
    labels: string[];
  };
}

interface CepState {
  data: CepData | null;
  isLoading: boolean;
  error: string | null;
  loadCarta: (op: string) => Promise<void>;
  reset: () => void;
  registerMeasurement: (measurement: {
    v1: number;
    v2: number;
    v3: number;
    v4: number;
    v5: number;
    media: number;
    range: number;
    observacao: string;
  }) => Promise<void>;
}

export const useCepStore = create<CepState>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,

  reset: () => set({ data: null, error: null }),

  loadCarta: async (op) => {
    const { user, token } = useAuthStore.getState();
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/cep/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ op, matricula: user?.matricula })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar carta CEP');
      }

      set({ data: result, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  registerMeasurement: async (measurement) => {
    const { user, token } = useAuthStore.getState();
    const { data } = get();
    
    if (!data) return;

    try {
      const response = await fetch('/api/cep/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...measurement,
          op: data.op,
          numeroCarta: data.numeroCarta,
          usuario: user?.nome,
          dataHora: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao registrar medição');
      }

      // Atualiza o estado local para refletir a nova medição no gráfico imediatamente
      set((state) => {
        if (!state.data) return state;
        
        const newXbar = [...state.data.historico.xbar, measurement.media].slice(-25);
        const newRange = [...state.data.historico.range, measurement.range].slice(-25);
        const newLabels = Array.from({ length: newXbar.length }, (_, i) => (i + 1).toString());

        return {
          data: {
            ...state.data,
            historico: {
              xbar: newXbar,
              range: newRange,
              labels: newLabels
            }
          }
        };
      });
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }
}));
