import { chromium } from 'playwright';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

/**
 * Função principal de automação para extração de marcações de ponto
 */
async function extrairMarcacoesRH() {
  console.log('🚀 Iniciando automação de extração de ponto...');
  
  const browser = await chromium.launch({ headless: false }); // Headless false para visualizarmos a primeira vez
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Acessar o portal a partir do .env
    const portalUrl = process.env.RH_PORTAL_URL;
    const portalUser = process.env.RH_PORTAL_USER;
    const portalPass = process.env.RH_PORTAL_PASSWORD;

    if (!portalUrl || !portalUser || !portalPass) {
      throw new Error('Variáveis RH_PORTAL_URL, RH_PORTAL_USER ou RH_PORTAL_PASSWORD não configuradas no .env');
    }

    console.log(`Caminho para o portal: ${portalUrl}`);
    await page.goto(portalUrl);

    // 2. Realizar Login
    console.log('Realizando login...');
    // Nota: Os seletores abaixo (#usuario, #senha, #btn-login) são genéricos.
    // Precisaremos ajustá-los assim que tivermos acesso à estrutura do portal real.
    // await page.fill('#usuario', portalUser);
    // await page.fill('#senha', portalPass);
    // await page.click('#btn-login');
    // await page.waitForNavigation();

    // 3. Navegar até a tela de marcações
    console.log('Navegando para a tela de marcações...');
    // await page.click('text=Espelho de Ponto');

    // 4. Extrair dados da tabela
    console.log('Extraindo dados...');
    // Exemplo de como os dados poderiam ser extraídos
    const marcacoes = [
      // { matricula: '123', nome: 'João Silva', data: '2026-05-15', hora: '08:00', tipo: 'Entrada' },
      // { matricula: '123', nome: 'João Silva', data: '2026-05-15', hora: '12:00', tipo: 'Saída' }
    ];

    // 5. Salvar no Banco de Dados
    if (marcacoes.length > 0) {
      console.log(`Gravando ${marcacoes.length} marcações no banco de dados...`);
      for (const m of marcacoes) {
        await pool.query(
          'INSERT INTO rh_marcacoes (matricula, nome, data, hora, tipo) VALUES ($1, $2, $3, $4, $5)',
          [m.matricula, m.nome, m.data, m.hora, m.tipo]
        );
      }
      console.log('Dados gravados com sucesso!');
    } else {
      console.log('⚠️ Nenhuma marcação encontrada para gravar.');
    }

  } catch (error) {
    console.error('❌ Erro durante a automação:', error);
  } finally {
    await browser.close();
    await pool.end();
    console.log('🏁 Processo finalizado.');
  }
}

// Executa a função
extrairMarcacoesRH();
