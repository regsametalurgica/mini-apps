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
    xcol: number[];
    xbar: number[];
    range: number[];
    xop: string[];
    xdata: string[];
    xhora: string[];
    xmatricula: string[];
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
    dataHora: string;
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
        throw new Error(result.mensagem || result.error || 'Erro ao carregar carta CEP');
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

    // Calcula o novo histórico com a nova medição inclusa, limitando aos últimos 25 pontos
    const currentHistorico = data.historico || { xcol: [], xbar: [], range: [], xop: [], xdata: [], xhora: [], xmatricula: [], labels: [] };
    const newXbar = [...currentHistorico.xbar, measurement.media].slice(-25);
    const newRange = [...currentHistorico.range, measurement.range].slice(-25);
    const newLabels = Array.from({ length: newXbar.length }, (_, i) => (i + 1).toString());

    try {
      const response = await fetch('/api/cep/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          matricula: user?.matricula || '',
          dataHora: measurement.dataHora,
          v1: measurement.v1,
          v2: measurement.v2,
          v3: measurement.v3,
          v4: measurement.v4,
          v5: measurement.v5,
          media: measurement.media,
          range: measurement.range,
          observacao: measurement.observacao,
          historico: {
            ...currentHistorico,
            xbar: newXbar,
            range: newRange,
            labels: newLabels
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao registrar medição');
      }

      // Se o ERP/backend retornar a carta CEP completa e atualizada, nós a salvamos.
      // Caso contrário, fazemos a atualização local do histórico como fallback.
      if (result && result.historico) {
        set({ data: result });
      } else {
        set((state) => {
          if (!state.data) return state;

          return {
            data: {
              ...state.data,
              historico: {
                ...currentHistorico,
                xbar: newXbar,
                range: newRange,
                labels: newLabels
              }
            }
          };
        });
      }
    } catch (error: any) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }
}));
