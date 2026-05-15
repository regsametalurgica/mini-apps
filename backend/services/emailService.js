import nodemailer from 'nodemailer';
import pool from '../config/db.js';

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Buscar configurações de SMTP do banco de dados
    const result = await pool.query('SELECT chave, valor FROM configuracoes WHERE chave LIKE \'smtp_%\'');
    const config = result.rows.reduce((acc, row) => {
      acc[row.chave] = row.valor;
      return acc;
    }, {});

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      throw new Error('Configurações de SMTP incompletas no banco de dados.');
    }

    // Criar transportador
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port) || 465,
      secure: parseInt(config.smtp_port) === 465, // true para 465, false para outras
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });

    // Configurações do e-mail
    const mailOptions = {
      from: config.smtp_from || config.smtp_user,
      to,
      subject,
      text,
      html: html || text,
    };

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { success: false, error: error.message };
  }
};
