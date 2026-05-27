# Detalhes Técnicos - Controle Estatístico (CEP)

Este documento detalha a arquitetura técnica, integrações e tecnologias específicas utilizadas no mini app CEP.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript.
- **Gráficos:** `Chart.js` com o plugin `chartjs-plugin-annotation` para linhas de limite.
- **Integração de Gráficos:** `react-chartjs-2`.
- **Estilização:** Tailwind CSS.

## 🔌 Integração com Backend
O mini app CEP atua como uma interface operacional, consumindo e enviando dados para o servidor backend que intermedia a comunicação com o ERP.

A arquitetura do mini app CEP é dividida em duas camadas de comunicação para garantir segurança e flexibilidade:

### 1. Comunicação Interna (Frontend ➔ Backend Node.js)
O frontend (aplicação React no navegador) sempre envia os dados para as seguintes rotas **internas e fixas** do nosso próprio servidor backend:
- `POST /api/cep/load`: Usado para buscar os dados da carta CEP.
  - **Payload:** `{ "op": "string", "matricula": number }`
- `POST /api/cep/register`: Usado para enviar as medições coletadas.
  - **Payload:** Dados da medição (V1..V5, Média, Range, OP, Carta, Usuário, Data/Hora).

### 2. Integração Externa (Backend Node.js ➔ ERP Protheus)
Quando o nosso backend recebe as requisições nas rotas internas acima, ele repassa esses dados para o ERP Protheus. 
Os caminhos (URLs) e as credenciais do Protheus **não são fixos**. Eles são dinâmicos e ficam salvos no **Banco de Dados** (tabela `aplicativos`), podendo ser alterados a qualquer momento pelo Painel de Administração (`/admin/configuracoes`).
- **Endpoint de Carregamento (Load):** URL externa real do ERP (ex: `http://protheus:8084/rest/api/cep/load`).
- **Endpoint de Registro (Register):** URL externa real do ERP (ex: `http://protheus:8084/rest/api/cep/register`).
- **Usuário API (Basic Auth) e Senha API:** Credenciais salvas de forma segura no banco de dados para o backend se autenticar com o ERP.

O backend lê esses dados do banco em tempo real e anexa automaticamente o cabeçalho HTTP `Authorization: Basic <hash_base64>` para garantir o acesso. Caso os endpoints não estejam configurados no admin, o backend simula a comunicação (mock) para fins de teste.

## 🧮 Regras de Negócio e Cálculos
O sistema implementa os seguintes cálculos estatísticos:
- **Média (Xbar):** $\bar{X} = \frac{\sum_{i=1}^{n} V_i}{n}$ (onde $n=5$).
- **Amplitude (Range):** $R = V_{max} - V_{min}$.

## 🗄️ Persistência
- **Dados Operacionais:** Persistidos exclusivamente no ERP Protheus. O mini app CEP não utiliza banco de dados local para armazenar medições, garantindo a integridade da "única fonte de verdade". O estado local é limpo a cada nova entrada no aplicativo para garantir que o operador sempre inicie uma nova consulta de OP.

---
*Documentação atualizada em: 15/05/2026*
