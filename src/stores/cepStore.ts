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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar carta CEP';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  registerMeasurement: async (measurement) => {
    const { user, token } = useAuthStore.getState();
    const { data } = get();
    
    if (!data) return;

    try {
      // Monta o payload para o ERP ordenando as chaves:
      // op e numeroCarta primeiro, depois os dados da medição, seguidos pelos outros campos do ERP
      const { op, numeroCarta, ...restOfData } = data;
      const restClean = { ...restOfData };
      delete (restClean as { historico?: unknown }).historico;

      const payload = {
        op,
        numeroCarta: numeroCarta || '',
        matricula: user?.matricula || '',            // Matrícula do usuário logado
        dataHora: measurement.dataHora,              // Data/hora da medição
        v1: measurement.v1,                          // 5 valores digitados
        v2: measurement.v2,
        v3: measurement.v3,
        v4: measurement.v4,
        v5: measurement.v5,
        media: measurement.media,                    // Média calculada
        range: measurement.range,                    // Amplitude calculada
        observacao: measurement.observacao,          // Observação do operador
        ...restClean                                 // Demais dados originais do ERP (cp, cpk, etc.)
      };

      console.log('[CEP Store] Payload enviado para /api/cep/register:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/cep/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao registrar medição');
      }

      // Se o ERP retornar a carta inteira e atualizada no PUT, usa ela.
      // Caso contrário, fazemos um POST novamente para carregar os dados atualizados.
      if (result && result.historico) {
        set({ data: result });
      } else {
        console.log('[CEP Store] Medição registrada. Fazendo nova requisição (POST) para atualizar os dados da OP:', op);
        await get().loadCarta(op);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }
}));
