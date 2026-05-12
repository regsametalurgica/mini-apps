import { create } from 'zustand';

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
  loadCarta: (op: string) => Promise<void>;
  registerMeasurement: (measurement: {
    v1: number;
    v2: number;
    v3: number;
    v4: number;
    v5: number;
    media: number;
    range: number;
    observacao: string;
  }) => void;
}

export const useCepStore = create<CepState>((set) => ({
  data: {
    op: "1958",
    numeroCarta: "12345",
    cp: 7.34,
    cpk: 7.03,
    numeroPeca: "MOLA-TRASEIRA-X",
    equipamento: "PRENSA-05",
    caracteristica: "DIÂMETRO EXTERNO",
    sequencia: "010",
    revisaoFicha: "REV-03",
    setor: "MOLAS",
    especificacao: "18.42 ±0.10",
    cliente: "FIAT",
    tamanhoAmostra: 5,
    frequencia: "30min",
    limitesControle: {
      xbar: { lsc: 18.52, media: 18.42, lic: 18.32 },
      range: { lsc: 0.45, media: 0.30, lic: 0.15 }
    },
    historico: {
      xbar: [18.40, 18.37, 18.50, 18.32, 18.45, 18.51, 18.36, 18.36, 18.50, 18.39, 18.40, 18.39, 18.36, 18.33, 18.46, 18.51, 18.46, 18.47, 18.44, 18.43, 18.36, 18.39, 18.38, 18.47, 18.50],
      range: [0.30, 0.32, 0.39, 0.22, 0.27, 0.24, 0.21, 0.28, 0.24, 0.22, 0.23, 0.28, 0.38, 0.22, 0.29, 0.22, 0.35, 0.33, 0.26, 0.28, 0.22, 0.21, 0.24, 0.33, 0.36],
      labels: Array.from({ length: 25 }, (_, i) => (i + 1).toString())
    }
  },
  isLoading: false,
  loadCarta: async (op) => {
    set({ isLoading: true });
    // Simulação de delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
    // Aqui seria o fetch real
    set({ isLoading: false });
  },
  registerMeasurement: (measurement) => {
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
  }
}));
