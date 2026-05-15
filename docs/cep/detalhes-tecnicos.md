# Detalhes Técnicos - Controle Estatístico (CEP)

Este documento detalha a arquitetura técnica, integrações e tecnologias específicas utilizadas no mini app CEP.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript.
- **Gráficos:** `Chart.js` com o plugin `chartjs-plugin-annotation` para linhas de limite.
- **Integração de Gráficos:** `react-chartjs-2`.
- **Estilização:** Tailwind CSS.

## 🔌 Integração com Backend
O mini app CEP atua como uma interface operacional, consumindo e enviando dados para o servidor backend que intermedia a comunicação com o ERP.

### Endpoints da API:
- `POST /api/cep/load`: Carrega os dados da carta CEP.
  - **Payload:** `{ "op": "string", "matricula": number }`
- `POST /api/cep/register`: Envia as medições para persistência.
  - **Payload:** Dados da medição (V1..V5, Média, Range, OP, Carta, Usuário, Data/Hora).

## 🧮 Regras de Negócio e Cálculos
O sistema implementa os seguintes cálculos estatísticos:
- **Média (Xbar):** $\bar{X} = \frac{\sum_{i=1}^{n} V_i}{n}$ (onde $n=5$).
- **Amplitude (Range):** $R = V_{max} - V_{min}$.

## 🗄️ Persistência
- **Dados Operacionais:** Persistidos exclusivamente no ERP Protheus. O mini app CEP não utiliza banco de dados local para armazenar medições, garantindo a integridade da "única fonte de verdade". O estado local é limpo a cada nova entrada no aplicativo para garantir que o operador sempre inicie uma nova consulta de OP.

---
*Documentação atualizada em: 15/05/2026*
