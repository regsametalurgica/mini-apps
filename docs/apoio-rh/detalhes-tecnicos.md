# Detalhes Técnicos - Apoio RH

Este documento detalha a arquitetura técnica, estrutura de dados e integrações do mini app Apoio RH.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript + Tailwind CSS.
- **Ícones:** Bootstrap Icons.
- **Backend:** Node.js + Express.
- **Banco de Dados:** PostgreSQL (Tabelas locais).
- **Automação:** Playwright (Web Scraping / Navegação Automática).

## 🗄️ Estrutura de Dados (Banco de Dados Local)
O mini app Apoio RH utiliza tabelas locais no PostgreSQL para gestão de funcionários e marcações integradas.

### Tabelas Principais:
- **`funcionarios_regsa`**: Cadastro base de colaboradores (Matrícula, Nome, CPF, Cargo, Departamento, Data Admissão).
- **`marcacoes_ponto_regsa`**: Registro de marcações processadas (Funcionario_id, Data, Hora, Tipo, Origem).
- **`rh_marcacoes`**: Registro bruto de marcações extraídas via automação (Matrícula, Nome, Data, Hora, Tipo, Origem).

## 🔌 Integrações e Fluxos

### Fluxo do Agente de Marcações:
1. **Portal RH / Relógio de Ponto:** Automação via **Playwright** acessa o portal de marcações.
2. **Banco de Dados:** Gravação dos dados extraídos na tabela `rh_marcacoes`.
3. **Agente de IA:** Processamento lógico para detecção de inconsistências baseado na jornada configurada.
4. **Saída de Informação:** Geração de relatórios diários e alertas de RH.

---
*Documentação atualizada em: 15/05/2026*
