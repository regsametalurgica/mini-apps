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
export async function extrairMarcacoesRH(onProgress = () => {}) {
  try {
    onProgress({ step: 1, message: 'Iniciando navegador e acessando o portal...' });
    console.log('🚀 Iniciando automação de extração de ponto...');
    
    const browser = await chromium.launch({ headless: false }); // Mantendo headless false para depuração
    const context = await browser.newContext();
    const page = await context.newPage();

    const portalUrl = process.env.RH_PORTAL_URL;
    const portalUser = process.env.RH_PORTAL_USER;
    const portalPass = process.env.RH_PORTAL_PASSWORD;

    if (!portalUrl || !portalUser || !portalPass) {
      throw new Error('Variáveis RH_PORTAL_URL, RH_PORTAL_USER ou RH_PORTAL_PASSWORD não configuradas no .env');
    }

    console.log(`Caminho para o portal: ${portalUrl}`);
    await page.goto(portalUrl, { waitUntil: 'networkidle' });

    // 1. Realizar Login no Kairos
    onProgress({ step: 1, message: 'Realizando login no Kairos...' });
    console.log('Realizando login...');
    await page.waitForSelector('input[type="text"], input[type="email"], #LogOnModel_UserName', { state: 'visible' });
    await page.locator('input[type="text"], input[type="email"], #LogOnModel_UserName').first().fill(portalUser);
    await page.locator('input[type="password"], #LogOnModel_Password').first().fill(portalPass);
    await page.locator('button:has-text("Entrar"), input[value="Entrar"], .btn-success').first().click();
    
    await page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => console.log('Sem navigation explícita após login, prosseguindo...'));

    console.log('✅ Etapa 1 concluída: Acesso e Login realizados com sucesso no Kairos!');
    onProgress({ step: 2, message: 'Verificando se existe mensagem de novidades para ignorar...' });

    // 2. Fechar modal (se existir)
    console.log('Verificando se há modal de comunicados...');
    try {
      const btnFecharModal = await page.waitForSelector('#closeModal, #soCloseModal', { timeout: 8000 });
      if (btnFecharModal) {
        console.log('Modal detectado! Fechando...');
        const btnNaoVerMais = await page.$('#closeModal');
        if (btnNaoVerMais) {
          await btnNaoVerMais.click({ force: true });
        } else {
          await page.click('#soCloseModal', { force: true });
        }
        await page.waitForTimeout(2000); 
        console.log('✅ Modal fechado com sucesso.');
      }
    } catch (e) {
      console.log('Nenhum modal detectado, prosseguindo...');
    }

    console.log('✅ Etapa 2 concluída: Verificação de modal finalizada!');
    onProgress({ step: 3, message: 'Acessando menu Marcações...' });
    
    // 3. Acessar Marcações
    console.log('Acessando a aba Marcações (#Tab2)...');
    await page.click('#Tab2', { force: true });
    await page.waitForTimeout(3000); 

    // 4. Aplicar Filtro de Data
    onProgress({ step: 4, message: 'Aplicando filtro para exibir apenas marcações de hoje...' });
    console.log('Aplicando filtro de data...');

    const hoje = new Date();
    const dataHojeStr = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;
    console.log(`Filtrando marcações para a data atual: ${dataHojeStr}`);

    try {
      const toggleFiltro = await page.$('text="A exibir resultados do filtro"');
      if (toggleFiltro) await toggleFiltro.click({ force: true });
      await page.waitForTimeout(1000);
    } catch (e) {}

    await page.evaluate((dataAlvo) => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      let dateInputs = inputs.filter(inp => {
        const str = (inp.id + inp.name + inp.className).toLowerCase();
        return str.includes('data') || str.includes('inicio') || str.includes('fim') || str.includes('date');
      });

      dateInputs.forEach(inp => {
        inp.value = dataAlvo;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      });

      const botoes = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
      const btnFiltrar = botoes.find(btn => {
        const texto = (btn.value || btn.innerText || btn.id || btn.className).toLowerCase();
        return texto.includes('filtrar') || texto.includes('pesquisar') || texto.includes('aplicar') || texto.includes('buscar');
      });

      if (btnFiltrar) {
        btnFiltrar.click();
      } else if (dateInputs.length > 0) {
        const event = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true });
        dateInputs[0].dispatchEvent(event);
      }
    }, dataHojeStr);

    await page.waitForTimeout(4000);
    console.log('✅ Etapa 4 concluída: Filtro de data aplicado.');

    // 5. Ler a tabela e navegar pela paginação
    onProgress({ step: 5, message: 'Lendo as marcações página por página...' });
    console.log('Iniciando leitura com paginação...');
    
    let todasMarcacoes = [];
    let temProximaPagina = true;
    let paginaAtual = 1;

    while (temProximaPagina) {
      onProgress({ step: 5, message: `Lendo a página ${paginaAtual} de marcações...` });
      
      const marcacoesDaPagina = await page.evaluate((dataAlvo) => {
        const resultados = [];
        const linhas = document.querySelectorAll('table tr');
        
        linhas.forEach(linha => {
          if (linha.classList.contains('TableHeader')) return;

          const colunas = linha.querySelectorAll('td');
          if (colunas.length >= 4) {
            const tdTexts = Array.from(colunas).map(td => td.innerText.trim()).filter(txt => txt.length > 0);
            
            let dataHoraEncontrada = '';
            let dataHoraIndex = -1;

            for (let i = 0; i < tdTexts.length; i++) {
              if (/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/.test(tdTexts[i])) {
                dataHoraEncontrada = tdTexts[i];
                dataHoraIndex = i;
                break;
              }
            }

            if (dataHoraEncontrada && dataHoraEncontrada.includes(dataAlvo)) {
              let relogio_tipo = '';
              let pessoa = '';
              let pis = '';

              if (dataHoraIndex >= 3) {
                 relogio_tipo = tdTexts[dataHoraIndex - 3];
                 pessoa = tdTexts[dataHoraIndex - 2];
                 pis = tdTexts[dataHoraIndex - 1];
              } else if (tdTexts.length >= 4) {
                 relogio_tipo = tdTexts[0];
                 pessoa = tdTexts[1];
                 pis = tdTexts[2];
              }

              resultados.push({
                relogio_tipo,
                pessoa,
                pis,
                data_hora: dataHoraEncontrada
              });
            }
          }
        });
        return resultados;
      }, dataHojeStr);

      todasMarcacoes = todasMarcacoes.concat(marcacoesDaPagina);
      console.log(`Lidos ${marcacoesDaPagina.length} registros na página ${paginaAtual}. Total acumulado: ${todasMarcacoes.length}`);

      // Tentar encontrar e clicar no botão de "Próxima página"
      try {
        const nextBtn = await page.$('.PagedList-skipToNext a, .next a, a[title="Próxima"], a:has-text("Próximo"), a:has-text("Próxima"), li.next:not(.disabled) a, a.next');
        
        if (nextBtn) {
          const isBtnDisabled = await page.evaluate(el => {
            if (el.hasAttribute('disabled')) return true;
            if (el.parentElement && el.parentElement.classList.contains('disabled')) return true;
            if (el.classList.contains('disabled')) return true;
            // Se o href for # ou se não tiver onclick válido (depende do Kairos, mas geralmente a classe disabled é o padrão)
            return false;
          }, nextBtn);

          if (!isBtnDisabled) {
            console.log('Avançando para a próxima página...');
            await nextBtn.click({ force: true });
            await page.waitForTimeout(4000); // Aguardar o Kairos carregar a próxima tabela
            paginaAtual++;
          } else {
            console.log('Chegou na última página (botão Próximo desabilitado).');
            temProximaPagina = false;
          }
        } else {
          console.log('Nenhum botão de Próxima página encontrado. Fim da paginação.');
          temProximaPagina = false;
        }
      } catch (e) {
        console.log('Erro ao tentar avançar a página. Encerrando paginação.', e);
        temProximaPagina = false;
      }
    }

    console.log(`✅ Etapa 5 concluída: Total de ${todasMarcacoes.length} marcações encontradas.`);

    // 6. Salvar no Banco de Dados
    if (todasMarcacoes.length > 0) {
      onProgress({ step: 6, message: `Gravando todos os ${todasMarcacoes.length} registros no banco local PostgreSQL...` });
      console.log('Gravando no banco de dados postgres...');
      
      for (const m of todasMarcacoes) {
        const [dataPart, horaPart] = m.data_hora.split(' ');
        const dataFormatada = dataPart.split('/').reverse().join('-') + ' ' + horaPart;
        
        await pool.query(
          'INSERT INTO rh_marcacoes (relogio_tipo, pessoa, pis, data_hora) VALUES ($1, $2, $3, $4)',
          [m.relogio_tipo, m.pessoa, m.pis, dataFormatada]
        );
      }
      console.log('✅ Dados gravados no Postgres com sucesso!');
      onProgress({ step: 'CONCLUIDO', message: `Automação concluída! ${todasMarcacoes.length} registros salvos hoje em ${paginaAtual} páginas.` });
      await browser.close();
      return { success: true, count: todasMarcacoes.length, message: `Sucesso! ${todasMarcacoes.length} registros.` };
    } else {
      console.log('Nenhuma marcação de hoje encontrada para gravar.');
      onProgress({ step: 'CONCLUIDO', message: 'Nenhuma marcação encontrada na data atual após ler as páginas.' });
      await browser.close();
      return { success: true, count: 0, message: 'Nenhuma marcação encontrada para gravar.' };
    }

  } catch (error) {
    onProgress({ step: 'ERRO', message: `Erro na automação: ${error.message}` });
    console.error('❌ Erro durante a automação:', error);
    return { success: false, error: error.message };
  }
}

// Execução isolada via terminal
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  extrairMarcacoesRH(console.log).then(() => pool.end());
}
