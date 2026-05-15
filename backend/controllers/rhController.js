import { extrairMarcacoesRH } from '../scripts/playwright_rh.js';
import pool from '../config/db.js';

export const iniciarAutomacaoRH = async (req, res) => {
  // Configurar headers para SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Enviar evento inicial de handshake
  res.write(`data: ${JSON.stringify({ step: 0, message: 'Conectado ao servidor...' })}\n\n`);

  try {
    const result = await extrairMarcacoesRH((progress) => {
      // Envia os eventos de progresso para o cliente
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    });

    if (result.success) {
      res.write(`data: ${JSON.stringify({ step: 'CONCLUIDO', message: result.message || 'Automação finalizada.' })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({ step: 'ERRO', message: result.message || result.error })}\n\n`);
    }
  } catch (error) {
    res.write(`data: ${JSON.stringify({ step: 'ERRO', message: 'Erro crítico no servidor.', error: error.message })}\n\n`);
  } finally {
    // Encerrar a conexão SSE
    res.end();
  }
};

export const getMarcacoesRH = async (req, res) => {
  const { data } = req.query; // Espera formato YYYY-MM-DD
  try {
    let query = 'SELECT * FROM rh_marcacoes';
    let params = [];

    if (data) {
      query += ' WHERE DATE(data_hora) = $1';
      params.push(data);
    }

    query += ' ORDER BY data_hora DESC';

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar marcações:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar marcações', error: error.message });
  }
};
