import { create } from 'zustand';

interface CepLimits {
  lsc: number;
  media: number;
  lic: number;
}

export interface ObservacaoPonto {
  ponto: string;
  obs: string;
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
  autorizagravar?: boolean;
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
  xobservacao?: ObservacaoPonto[];
}

interface CepState {
  data: CepData | null;
  isLoading: boolean;
  error: string | null;
  matricula: string;
  recurso: string;
  setParams: (matricula: string, recurso: string) => void;
  loadCarta: (op: string, matricula: string, recurso: string, numeroCarta?: string) => Promise<void>;
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
  matricula: '',
  recurso: '',

  reset: () => set({ data: null, error: null }),

  setParams: (matricula, recurso) => set({ matricula, recurso }),

  loadCarta: async (op, matricula, recurso, numeroCarta) => {
    const currentData = get().data;
    set({ isLoading: true, error: null, matricula, recurso });

    try {
      const response = await fetch('/api/cep/load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          op,
          matricula,
          numeroCarta: numeroCarta || currentData?.numeroCarta || '',
          recurso: recurso || ''
        })
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
    const { data, matricula, recurso } = get();
    
    if (!data) return;

    if (data.autorizagravar === false) {
      throw new Error('Lançamento bloqueado: o ERP não autorizou gravação para esta Ordem de Produção.');
    }

    try {
      // Monta o payload para o ERP ordenando as chaves:
      // op e numeroCarta primeiro, depois os dados da medição, seguidos pelos outros campos do ERP
      const { op, numeroCarta, ...restOfData } = data;
      const restClean = { ...restOfData };
      delete (restClean as { historico?: unknown }).historico;

      const payload = {
        op,
        numeroCarta: numeroCarta || '',
        matricula: matricula || '',
        recurso: recurso || '',
        dataHora: measurement.dataHora,
        v1: measurement.v1,
        v2: measurement.v2,
        v3: measurement.v3,
        v4: measurement.v4,
        v5: measurement.v5,
        media: measurement.media,
        range: measurement.range,
        observacao: measurement.observacao,
        ...restClean
      };

      console.log('[CEP Store] Payload enviado para /api/cep/register:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/cep/register', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
        await get().loadCarta(op, matricula, recurso);
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  }
}));
