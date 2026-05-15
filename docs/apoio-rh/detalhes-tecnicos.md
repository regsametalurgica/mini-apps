# Detalhes Técnicos - Apoio RH

Este documento detalha a arquitetura técnica, estrutura de dados e integrações do mini app Apoio RH.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript + Tailwind CSS.
- **Ícones:** Bootstrap Icons.
- **Backend:** Node.js + Express.
- **Banco de Dados:** PostgreSQL (Tabelas locais).
- **Automação:** Playwright (Web Scraping / Navegação Automática).
- **Notificações:** Nodemailer (Servidor SMTP Titan/Hostgator).

## 🗄️ Estrutura de Dados (Banco de Dados Local)
O mini app Apoio RH utiliza tabelas locais no PostgreSQL para gestão de funcionários e marcações integradas.

### Tabelas Principais:
- **`funcionarios_regsa`**: Cadastro base de colaboradores (Matrícula, Nome, CPF, Cargo, Departamento, Data Admissão).
- **`rh_marcacoes`**: Registro bruto de marcações extraídas via automação.
  - **Constraint:** Unicidade baseada em `(pis, data_hora)` para evitar duplicatas.
  - **Lógica de Insert:** `ON CONFLICT DO NOTHING` garante integridade em múltiplas execuções.

## 🔌 Integrações e Fluxos

### Agente de Marcações (Automação Kairos):
O Agente de Marcações utiliza um motor Playwright para extrair dados em tempo real do portal Dimep.

#### 🔄 Lógica de Resiliência e Retry:
Para garantir a estabilidade do fluxo contra instabilidades de rede ou do portal, foi implementada a seguinte política:
1. **Tentativas:** O sistema realiza até **3 tentativas** automáticas.
2. **Intervalo:** Caso ocorra um erro, o sistema aguarda **3 minutos** antes de tentar novamente.
3. **Feedback:** O progresso é enviado via SSE (Server-Sent Events), informando ao usuário em qual tentativa o processo está.

#### 📧 Notificações e Relatórios:
- **Sucesso:** Após a conclusão (em qualquer uma das 3 tentativas), um relatório profissional em HTML é enviado com indicadores (Total de batidas, Colaboradores únicos, Janela de horário e Resumo por REP).
- **Falha Crítica:** Se as 3 tentativas falharem, um e-mail de alerta crítico é disparado para o RH informando o erro técnico e solicitando intervenção manual.

---
*Documentação atualizada em: 15/05/2026*
