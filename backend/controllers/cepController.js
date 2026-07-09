import pool from '../config/db.js';

/**
 * Controller para o Controle Estatístico de Processo (CEP)
 * Responsável pela integração com o ERP para carregar e registrar dados de qualidade.
 */

// Simulação de banco de dados do ERP (para fins de demonstração)
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
    autorizagravar: true,
    limitesControle: {
      xbar: { lsc: 18.52, media: 18.42, lic: 18.32 },
      range: { lsc: 0.45, media: 0.30, lic: 0.15 }
    },
    historico: {
      xcol: [],
      xbar: [18.40, 18.37, 18.50, 18.32, 18.45, 18.51, 18.36, 18.36, 18.50, 18.39, 18.40, 18.39, 18.36, 18.33, 18.46, 18.51, 18.46, 18.47, 18.44, 18.43, 18.36, 18.39, 18.38, 18.47, 18.50],
      range: [0.30, 0.32, 0.39, 0.22, 0.27, 0.24, 0.21, 0.28, 0.24, 0.22, 0.23, 0.28, 0.38, 0.22, 0.29, 0.22, 0.35, 0.33, 0.26, 0.28, 0.22, 0.21, 0.24, 0.33, 0.36],
      xop: [],
      xdata: [],
      xhora: [],
      xmatricula: [],
      labels: Array.from({ length: 25 }, (_, i) => (i + 1).toString())
    }
  },
  "1959": {
    op: "1959",
    numeroCarta: "54321",
    cp: 6.20,
    cpk: 5.80,
    numeroPeca: "MOLA-TRASEIRA-Y",
    equipamento: "PRENSA-05",
    caracteristica: "LARGURA",
    sequencia: "020",
    revisaoFicha: "REV-01",
    setor: "MOLAS",
    especificacao: "10.00 ±0.05",
    cliente: "FORD",
    tamanhoAmostra: 5,
    frequencia: "30min",
    autorizagravar: false,
    limitesControle: {
      xbar: { lsc: 10.05, media: 10.00, lic: 9.95 },
      range: { lsc: 0.15, media: 0.10, lic: 0.05 }
    },
    historico: {
      xcol: [],
      xbar: [10.00, 10.01, 9.99, 10.00, 10.02, 9.98, 10.01, 10.03, 9.99, 10.00],
      range: [0.08, 0.09, 0.07, 0.08, 0.10, 0.06, 0.07, 0.09, 0.08, 0.07],
      xop: [],
      xdata: [],
      xhora: [],
      xmatricula: [],
      labels: Array.from({ length: 10 }, (_, i) => (i + 1).toString())
    }
  },
  "079201": {
    op: "079201",
    numeroCarta: "000033",
    cp: 5.06,
    cpk: 5,
    ITEMPO: "0009",
    SUBIPO: "   ",
    RECURSO: "513",
    CHAVESZP: "00000000000000009201",
    REVQK9: "05",
    PECQK9: "20.5320.5006.100                        ",
    autorizagravar: false,
    numeroPeca: "2053205006100",
    equipamento: "EG-450 - 1",
    caracteristica: "F1 A 17,00 mm",
    sequencia: "03",
    revisaoFicha: "23/01/2024",
    setor: "RETIFICA",
    especificacao: "7,90 a 9,36 KG",
    cliente: "AUMOVIO BRAZIL",
    tamanhoAmostra: 5,
    frequencia: 4,
    limitesControle: {
      xbar: {
        lsc: 8.82,
        media: 8.73,
        lic: 8.64
      },
      range: {
        lsc: 0.32,
        media: 0.15,
        lic: 0
      }
    },
    historico: {
      xcol: [],
      xbar: [8.70, 8.73, 8.75, 8.71, 8.74, 8.72, 8.73, 8.76, 8.71, 8.72],
      range: [0.12, 0.15, 0.11, 0.14, 0.13, 0.12, 0.15, 0.16, 0.11, 0.14],
      xop: [],
      xdata: [],
      xhora: [],
      xmatricula: [],
      labels: Array.from({ length: 10 }, (_, i) => (i + 1).toString())
    }
  }
};

/**
 * Obtém as configurações do ERP Protheus a partir das variáveis de ambiente (.env).
 * Não consulta mais o banco de dados — tudo vem do arquivo .env na raiz do projeto.
 */
const getProtheusConfig = () => {
  return {
    load: process.env.PROTHEUS_ENDPOINT_CEP_LOAD || null,
    register: process.env.PROTHEUS_ENDPOINT_CEP_REGISTER || null,
    recursos: process.env.PROTHEUS_ENDPOINT_CEP_RECURSOS || null,
    user: process.env.PROTHEUS_API_USER || null,
    password: process.env.PROTHEUS_API_PASSWORD || null
  };
};

/**
 * Carrega os dados da carta CEP a partir de uma OP
 */
export const loadCartaCEP = async (req, res) => {
  try {
    const { op, matricula, numeroCarta, recurso } = req.body;

    if (!op) {
      return res.status(400).json({ error: 'Número da OP é obrigatório.' });
    }

    console.log(`[CEP] Carregando carta para OP: ${op} (Matrícula: ${matricula}, Carta: ${numeroCarta || 'N/A'}, Recurso: ${recurso || 'N/A'})`);

    const config = getProtheusConfig();

    // Log de diagnóstico das variáveis carregadas
    console.log(`[CEP] Config ERP carregada do .env:`, {
      load: config.load,
      register: config.register,
      user: config.user,
      passwordPresente: !!config.password
    });

    if (config.load) {
      console.log(`[CEP] Consultando ERP Externo via Endpoint: ${config.load}`);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (config.user && config.password) {
          const authBuffer = Buffer.from(`${config.user}:${config.password}`).toString('base64');
          headers['Authorization'] = `Basic ${authBuffer}`;
        }

        const erpResponse = await fetch(config.load, {
          method: 'POST',
          headers,
          body: JSON.stringify({ op, matricula, numeroCarta: numeroCarta || '', recurso: recurso || '' })
        });
        const data = await erpResponse.json();
        if (!erpResponse.ok) {
          return res.status(erpResponse.status).json(data);
        }
        return res.json(data);
      } catch (erpError) {
        console.error('[CEP] Erro ao consultar ERP Externo:', erpError.message);
        console.error('[CEP] Detalhes do erro:', { cause: erpError.cause, code: erpError.code, name: erpError.name });
        console.log('[CEP] Fallback: Utilizando Mock Data para a OP:', op);
        const carta = mockErpData[op];
        if (carta) {
          return res.json(carta);
        }
        return res.status(502).json({ error: 'Falha ao comunicar com o ERP Externo (Load).' });
      }
    }

    // Busca no "ERP" Mockado se endpoint não configurado
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

    console.log('[CEP] === REGISTRANDO MEDIÇÃO NO ERP ===');
    console.log('[CEP] Payload recebido do frontend:', JSON.stringify(measurementData, null, 2));

    const config = getProtheusConfig();

    console.log('[CEP] Config ERP para registro:', {
      register: config.register,
      user: config.user,
      passwordPresente: !!config.password
    });

    if (config.register) {
      console.log(`[CEP] Enviando POST para ERP: ${config.register}`);
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (config.user && config.password) {
          const authBuffer = Buffer.from(`${config.user}:${config.password}`).toString('base64');
          headers['Authorization'] = `Basic ${authBuffer}`;
        }

        // Reconstrói o JSON garantindo a ordem das chaves solicitada pelo ERP
        const {
          op,
          numeroCarta,
          matricula,
          recurso,
          dataHora,
          v1,
          v2,
          v3,
          v4,
          v5,
          media,
          range,
          observacao,
          historico, // extraímos historico para que não seja enviado ao Protheus
          ...restOfData
        } = measurementData;

        const orderedData = {
          op,
          numeroCarta: numeroCarta || "",
          matricula,
          recurso: recurso || "",
          dataHora,
          v1,
          v2,
          v3,
          v4,
          v5,
          media,
          range,
          observacao,
          ...restOfData
        };

        console.log('[CEP] Payload final estruturado enviado ao ERP Protheus:', JSON.stringify(orderedData, null, 2));

        const erpResponse = await fetch(config.register, {
          method: 'PUT',
          headers,
          body: JSON.stringify(orderedData)
        });
        const data = await erpResponse.json();
        console.log('[CEP] Resposta do ERP (status:', erpResponse.status, '):', JSON.stringify(data, null, 2));
        return res.status(erpResponse.status).json(data);
      } catch (erpError) {
        console.error('[CEP] Erro ao enviar medição ao ERP Externo:', erpError.message);
        console.error('[CEP] Detalhes do erro:', { cause: erpError.cause, code: erpError.code, name: erpError.name });
        console.log('[CEP] Fallback: Registrando localmente no Mock Data para a OP:', measurementData.op);
        const { op, historico } = measurementData;
        if (op && mockErpData[op]) {
          if (historico) {
            mockErpData[op].historico = historico;
          }
          return res.status(200).json(mockErpData[op]);
        }
        return res.status(502).json({ error: 'Falha ao comunicar com o ERP Externo (Register).' });
      }
    }

    // Simulação de sucesso se não houver endpoint configurado
    res.status(201).json({
      message: 'Medição registrada com sucesso no ERP (Simulação)!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao registrar medição CEP:', error);
    res.status(500).json({ error: 'Erro ao persistir medição no ERP.' });
  }
};

/**
 * Carrega os recursos disponíveis para um operador (matrícula) a partir do ERP
 */
export const loadRecursosCEP = async (req, res) => {
  try {
    const { matricula } = req.body;

    if (!matricula) {
      return res.status(400).json({ error: 'Matrícula é obrigatória.' });
    }

    console.log(`[CEP] ========================================`);
    console.log(`[CEP] REQUISIÇÃO DE RECURSOS`);
    console.log(`[CEP] Matrícula: ${matricula}`);
    console.log(`[CEP] ========================================`);

    const config = getProtheusConfig();

    if (!config.recursos) {
      console.error('[CEP] !!! Endpoint CEP_RECURSOS não configurado no .env');
      return res.status(503).json({ error: 'Endpoint de recursos não configurado. Verifique a variável PROTHEUS_ENDPOINT_CEP_RECURSOS no .env.' });
    }

    console.log(`[CEP] >>> Enviando POST para ERP: ${config.recursos}`);
    console.log(`[CEP] >>> Payload: ${JSON.stringify({ matricula })}`);

    const headers = { 'Content-Type': 'application/json' };
    if (config.user && config.password) {
      const authBuffer = Buffer.from(`${config.user}:${config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${authBuffer}`;
    }

    const erpResponse = await fetch(config.recursos, {
      method: 'POST',
      headers,
      body: JSON.stringify({ matricula })
    });
    const data = await erpResponse.json();
    console.log(`[CEP] <<< Resposta do ERP (status: ${erpResponse.status}):`);
    console.log('[CEP] <<< Dados:', JSON.stringify(data, null, 2));

    if (!erpResponse.ok) {
      return res.status(erpResponse.status).json(data);
    }

    return res.json(data);
  } catch (error) {
    console.error(`[CEP] !!! FALHA ao carregar recursos do ERP: ${error.message}`);
    console.error(`[CEP] !!! Detalhes:`, { cause: error.cause, code: error.code });
    res.status(502).json({ error: 'Falha ao carregar recursos do ERP. Verifique a conexão com o Protheus.' });
  }
};

/**
 * Retorna o status da configuração do ERP Protheus para o painel admin.
 * Os valores sensíveis (senha) são mascarados. Não expõe credenciais.
 */
export const getErpConfigStatus = (req, res) => {
  const config = getProtheusConfig();

  const mascarar = (valor) => {
    if (!valor) return null;
    if (valor.length <= 4) return '****';
    return valor.substring(0, 3) + '*'.repeat(valor.length - 3);
  };

  const mascararUrl = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.hostname}:${parsed.port}${parsed.pathname}`;
    } catch {
      // Se não for URL válida, mascara parcialmente
      return url.length > 10 ? url.substring(0, 10) + '...' : url;
    }
  };

  res.json({
    configurado: !!(config.load && config.user && config.password),
    protheus_api_url: process.env.PROTHEUS_API_URL || null,
    endpoint_load: mascararUrl(config.load),
    endpoint_register: mascararUrl(config.register),
    api_user: mascarar(config.user),
    api_password: config.password ? '••••••••' : null,
    fonte: 'Arquivo .env (variáveis de ambiente)'
  });
};
