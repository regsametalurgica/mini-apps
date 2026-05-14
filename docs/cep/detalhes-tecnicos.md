# Detalhes Técnicos - Controle Estatístico (CEP)

Este documento detalha a arquitetura técnica, integrações e tecnologias específicas utilizadas no mini app CEP.

## 🛠️ Stack Tecnológica
- **Frontend:** React + TypeScript.
- **Gráficos:** `Chart.js` com o plugin `chartjs-plugin-annotation` para linhas de limite.
- **Integração de Gráficos:** `react-chartjs-2`.
- **Estilização:** Tailwind CSS.

## 🔌 Integração com ERP Protheus
O mini app CEP atua como uma interface operacional, consumindo e enviando dados para o ERP Protheus através de uma API REST no backend Node.js.

### Endpoints Principais:
- `POST /erp/cep/load`: Carrega os dados da carta CEP a partir de uma OP e Usuário.
- `POST /erp/cep/register`: Envia as medições, cálculos e observações para persistência oficial no ERP.

## 🧮 Regras de Negócio e Cálculos
O sistema implementa os seguintes cálculos estatísticos:
- **Média (Xbar):** $\bar{X} = \frac{\sum_{i=1}^{n} V_i}{n}$ (onde $n=5$).
- **Amplitude (Range):** $R = V_{max} - V_{min}$.

## 🗄️ Persistência
- **Dados Operacionais:** Persistidos exclusivamente no ERP Protheus. O mini app CEP não utiliza banco de dados local para armazenar medições, garantindo a integridade da "única fonte de verdade".

---
*Documentação atualizada em: 14/05/2026*
