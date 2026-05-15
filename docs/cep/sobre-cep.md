# Mini App: Controle Estatístico de Processo (CEP)

O mini app de **Controle Estatístico de Processo (CEP)** foi desenvolvido para digitalizar e otimizar o monitoramento da qualidade na produção da Regsa Metalúrgica, substituindo os antigos controles manuais em papel.

## 🎯 Objetivo
Centralizar e digitalizar o processo de CEP industrial, oferecendo rastreabilidade, rapidez operacional e redução de erros através do cálculo automático de estatísticas e integração direta com o ERP.

## ✨ Funcionalidades Principais
- **Consulta de Ordens de Produção (OP):** Busca automática das cartas CEP vinculadas à OP informada.
- **Lançamento de Medições:** Interface rápida para entrada de 5 valores (V1 a V5) por amostra.
- **Cálculos Automáticos:** O sistema calcula instantaneamente a Média (Xbar) e a Amplitude (Range).
- **Gráficos em Tempo Real:** Visualização dinâmica de cartas Xbar e Range com limites de controle (LSC, LIC e Média).
- **Histórico de Pontos:** Exibição dos últimos 25 pontos registrados para análise de tendência.
- **Detecção de Desvios:** Destaque visual automático para pontos que ultrapassam os limites estabelecidos.

## 🔄 Fluxo de Operação
1. **Entrada Obrigatória:** Toda vez que o operador acessa o app, o sistema limpa sessões anteriores e abre um modal de busca.
2. **Identificação:** O operador informa a **OP**. O sistema captura automaticamente a **Matrícula** do usuário logado.
3. **Carga de Dados:** Uma requisição é enviada ao backend (`OP` + `Matrícula`).
4. **Integração:** O sistema carrega os parâmetros da **Carta CEP** (limites, histórico, dados da peça).
5. **Registro:** O operador insere as medições e clica em **Registrar**.
6. **Persistência:** Os dados são enviados ao ERP para persistência oficial e os gráficos são atualizados em tempo real.

---
*Documentação atualizada em: 15/05/2026*
