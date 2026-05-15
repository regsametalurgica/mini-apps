/**
 * Controller para o Controle Estatístico de Processo (CEP)
 * Responsável pela integração com o ERP para carregar e registrar dados de qualidade.
 */

// Simulação de banco de dados do ERP (para fins de demonstração)
// Em produção, isso seria substituído por chamadas ao Protheus ou outro ERP
const mockErpData = {
  "1958": {
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
  }
};

/**
 * Carrega os dados da carta CEP a partir de uma OP
 */
export const loadCartaCEP = async (req, res) => {
  try {
    const { op, matricula } = req.body;

    if (!op) {
      return res.status(400).json({ error: 'Número da OP é obrigatório.' });
    }

    console.log(`[CEP] Carregando carta para OP: ${op} (Matrícula: ${matricula})`);

    // Busca no "ERP"
    const carta = mockErpData[op];

    if (!carta) {
      return res.status(404).json({ error: 'Ordem de Produção não encontrada no ERP.' });
    }

    // Retorna os dados para o frontend
    res.json(carta);
  } catch (error) {
    console.error('Erro ao carregar carta CEP:', error);
    res.status(500).json({ error: 'Erro interno ao processar requisição do CEP.' });
  }
};

/**
 * Registra uma nova medição no ERP
 */
export const registerMeasurementCEP = async (req, res) => {
  try {
    const measurementData = req.body;
    
    // Em um cenário real, aqui enviaríamos os dados para o ERP persistir
    console.log('[CEP] Registrando medição no ERP:', measurementData);

    // Simulação de sucesso e retorno do histórico atualizado
    // (O ERP normalmente retornaria o histórico completo novamente para garantir sincronia)
    res.status(201).json({ 
      message: 'Medição registrada com sucesso no ERP!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar medição CEP:', error);
    res.status(500).json({ error: 'Erro ao persistir medição no ERP.' });
  }
};
