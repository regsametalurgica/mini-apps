# Detalhes Técnicos - Apoio RH

Este documento detalha a arquitetura técnica, estrutura de dados e integrações do mini app Apoio RH.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript + Tailwind CSS.
- **Ícones:** Bootstrap Icons.
- **Backend:** Node.js + Express.
- **Banco de Dados:** PostgreSQL (Tabelas locais).

## 🗄️ Estrutura de Dados (Banco de Dados Local)
O mini app Apoio RH utiliza tabelas locais no PostgreSQL para gestão de funcionários e marcações integradas.

### Tabelas Principais:
- **`funcionarios_regsa`**: Cadastro base de colaboradores (Matrícula, Nome, CPF, Cargo, Departamento, Data Admissão).
- **`marcacoes_ponto_regsa`**: Registro de marcações processadas (Funcionario_id, Data, Hora, Tipo, Origem).

## 🔌 Integrações e Fluxos

### Fluxo do Agente de Marcações:
1. **Relógio de Ponto (Dimep):** Coleta física das batidas.
2. **Banco de Dados:** Sincronização dos registros AFD/batidas.
3. **Agente de IA:** Processamento lógico para detecção de inconsistências baseado na jornada configurada.
4. **Saída de Informação:** Geração de relatórios diários e alertas de RH.

---
*Documentação atualizada em: 14/05/2026*
