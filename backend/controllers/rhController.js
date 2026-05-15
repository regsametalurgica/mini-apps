import { extrairMarcacoesRH } from '../scripts/playwright_rh.js';
import pool from '../config/db.js';
import { sendEmail } from '../services/emailService.js';

// Função auxiliar para sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const iniciarAutomacaoRH = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.write(`data: ${JSON.stringify({ step: 0, message: 'Conectado ao servidor...' })}\n\n`);

  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 3 * 60 * 1000; // 3 minutos
  let attempt = 1;
  let success = false;
  let lastResult = null;

  while (attempt <= MAX_ATTEMPTS && !success) {
    try {
      if (attempt > 1) {
        res.write(`data: ${JSON.stringify({ step: 'RETRY', message: `Tentativa ${attempt}/${MAX_ATTEMPTS}: Reiniciando em instantes...` })}\n\n`);
        // Pequena pausa antes de avisar que está esperando
        await sleep(2000);
      }

      const result = await extrairMarcacoesRH((progress) => {
        // Inclui o número da tentativa no progresso para o frontend
        res.write(`data: ${JSON.stringify({ ...progress, attempt })}\n\n`);
      });

      lastResult = result;

      if (result.success) {
        success = true;
        res.write(`data: ${JSON.stringify({ step: 'CONCLUIDO', message: result.message || 'Automação finalizada.' })}\n\n`);
        
        // Enviar relatório de sucesso
        await enviarRelatorioSucesso(result);
      } else {
        throw new Error(result.error || result.message || 'Falha na extração');
      }

    } catch (error) {
      console.error(`Falha na tentativa ${attempt}:`, error.message);
      
      if (attempt < MAX_ATTEMPTS) {
        res.write(`data: ${JSON.stringify({ step: 'AGUARDANDO', message: `Erro na tentativa ${attempt}. Aguardando 3 minutos para nova tentativa...` })}\n\n`);
        await sleep(RETRY_DELAY_MS);
      } else {
        // Todas as tentativas falharam
        res.write(`data: ${JSON.stringify({ step: 'ERRO', message: 'Todas as tentativas de automação falharam.' })}\n\n`);
        await enviarRelatorioErro(error.message);
      }
    }
    attempt++;
  }

  res.end();
};

async function enviarRelatorioSucesso(result) {
  try {
    const appRes = await pool.query('SELECT notificar_por_email, email_notificacao FROM aplicativos WHERE id = $1', ['apoio-rh']);
    const app = appRes.rows[0];

    if (app && app.notificar_por_email && app.email_notificacao) {
      const statsRes = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(DISTINCT pis) as pessoas,
          MIN(data_hora) as primeira,
          MAX(data_hora) as ultima
        FROM rh_marcacoes 
        WHERE DATE(data_hora) = CURRENT_DATE
      `);
      const stats = statsRes.rows[0];

      const devicesRes = await pool.query(`
        SELECT relogio_tipo, COUNT(*) as qtd
        FROM rh_marcacoes 
        WHERE DATE(data_hora) = CURRENT_DATE
        GROUP BY relogio_tipo
        ORDER BY qtd DESC
      `);
      const devices = devicesRes.rows;

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #2c3e50; padding: 30px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Relatório de Automação</h1>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Integração Kairos Dimep - Apoio RH</p>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.6;">Olá,</p>
            <p style="font-size: 16px; line-height: 1.6;">Informamos que a automação local integrada ao portal <b>Kairos Dimep</b> foi executada com sucesso. Abaixo os resultados consolidados para a data de hoje:</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 25px 0;">
              <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; text-align: center;">
                <span style="display: block; font-size: 22px; font-weight: bold; color: #2c3e50;">${result.count || 0}</span>
                <span style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">Novos Registros</span>
              </div>
              <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #2ecc71; text-align: center;">
                <span style="display: block; font-size: 22px; font-weight: bold; color: #2c3e50;">${stats.total || 0}</span>
                <span style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">Total Hoje</span>
              </div>
              <div style="flex: 1; min-width: 120px; background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #e67e22; text-align: center;">
                <span style="display: block; font-size: 22px; font-weight: bold; color: #2c3e50;">${stats.pessoas || 0}</span>
                <span style="font-size: 11px; color: #7f8c8d; text-transform: uppercase;">Colaboradores</span>
              </div>
            </div>

            <h3 style="font-size: 14px; color: #2c3e50; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 30px;">Resumo por Equipamento (REP)</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #fcfcfc;">
                  <th style="text-align: left; padding: 10px; font-size: 12px; border-bottom: 1px solid #eee;">Equipamento</th>
                  <th style="text-align: center; padding: 10px; font-size: 12px; border-bottom: 1px solid #eee;">Marcações</th>
                </tr>
              </thead>
              <tbody>
                ${devices.map(d => `
                  <tr>
                    <td style="padding: 10px; font-size: 13px; border-bottom: 1px solid #f9f9f9; color: #555;">${d.relogio_tipo}</td>
                    <td style="padding: 10px; font-size: 13px; border-bottom: 1px solid #f9f9f9; text-align: center; font-weight: bold; color: #2c3e50;">${d.qtd}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 30px; padding: 20px; background-color: #ebf5fb; border-radius: 8px; border: 1px solid #d6eaf8;">
              <p style="margin: 0; font-size: 13px; color: #2980b9;">
                <b>Janela de Marcações:</b><br/>
                Primeira: ${stats.primeira ? new Date(stats.primeira).toLocaleTimeString('pt-BR') : '--:--'} | 
                Última: ${stats.ultima ? new Date(stats.ultima).toLocaleTimeString('pt-BR') : '--:--'}
              </p>
            </div>

            <p style="font-size: 12px; color: #95a5a6; margin-top: 40px; text-align: center;">
              Esta é uma mensagem automática gerada pelo Agente de Marcações.<br/>
              <b>Regsa Metalúrgica - Apoio RH</b>
            </p>
          </div>
          
          <div style="background-color: #fdfdfd; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0;">
            <span style="font-size: 11px; color: #bdc3c7;">Executado em: ${new Date().toLocaleString('pt-BR')}</span>
          </div>
        </div>
      `;

      await sendEmail({
        to: app.email_notificacao,
        subject: `Relatório Ponto Kairos - ${new Date().toLocaleDateString('pt-BR')}`,
        html: htmlContent
      });
    }
  } catch (err) {
    console.error('Erro ao enviar relatório de sucesso:', err);
  }
}

async function enviarRelatorioErro(errorMessage) {
  try {
    const appRes = await pool.query('SELECT notificar_por_email, email_notificacao FROM aplicativos WHERE id = $1', ['apoio-rh']);
    const app = appRes.rows[0];
    if (app && app.notificar_por_email && app.email_notificacao) {
      const errorHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ffcccc; border-radius: 8px; background-color: #fff5f5;">
          <h2 style="color: #c0392b;">⚠️ Falha Crítica na Automação Kairos</h2>
          <p>Informamos que o Agente de Marcações tentou executar a integração <b>3 vezes</b> sem sucesso.</p>
          <div style="padding: 15px; background: #fee2e2; border-radius: 5px; color: #991b1b; font-family: monospace; margin: 15px 0;">
            <b>Último Erro:</b> ${errorMessage}
          </div>
          <p style="font-size: 13px; color: #666;">
            <b>Possíveis causas:</b><br/>
            - Instabilidade na internet local ou no portal Kairos.<br/>
            - Mudança de senha ou bloqueio do usuário de RH.<br/>
            - Mudança estrutural no HTML do portal Dimep.
          </p>
          <p style="font-size: 12px; color: #95a5a6; margin-top: 25px; border-top: 1px solid #ffdada; pt: 10px;">
            Regsa Metalúrgica - Sistema de Automação
          </p>
        </div>
      `;
      await sendEmail({
        to: app.email_notificacao,
        subject: '❌ ERRO CRÍTICO: Automação Kairos Falhou (3 tentativas)',
        html: errorHtml
      });
    }
  } catch (e) {
    console.error('Erro ao enviar relatório de erro:', e);
  }
}

export const getMarcacoesRH = async (req, res) => {
  const { data } = req.query; 
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
