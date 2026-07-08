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
    user: process.env.PROTHEUS_API_USER || null,
    password: process.env.PROTHEUS_API_PASSWORD || null
  };
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
          body: JSON.stringify({ op, matricula })
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
