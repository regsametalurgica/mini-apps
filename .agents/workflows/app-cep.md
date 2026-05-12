---
description: Controle estatístico de processo
---

\# PRD — Mini App CEP Integrado ao ERP



\## 1. Visão Geral



Desenvolver um mini sistema web de Controle Estatístico de Processo (CEP) integrado ao ERP da empresa, permitindo:



\- consulta automática de cartas CEP via ERP

\- visualização de gráficos Xbar e Range

\- lançamento manual de medições

\- cálculo automático de média e amplitude

\- devolução completa dos dados processados ao ERP



O sistema será utilizado por operadores da produção para controle de qualidade em tempo real.



\---



\# 2. Objetivo do Projeto



Centralizar e digitalizar o processo de CEP industrial, substituindo controles manuais e oferecendo:



\- rastreabilidade

\- rapidez operacional

\- integração com ERP

\- redução de erros

\- atualização em tempo real dos gráficos



\---



\# 3. Fluxo Principal do Sistema



```text

Operador acessa Mini App CEP

&#x20;       ↓

Sistema solicita:

\- Ordem de Produção (OP)

&#x20;       ↓

Usuário informa OP

&#x20;       ↓

Sistema captura:

\- usuário logado

&#x20;       ↓

Frontend envia requisição ao ERP

&#x20;       ↓

ERP retorna JSON completo da carta CEP

&#x20;       ↓

Sistema carrega:

\- gráficos históricos

\- informações da carta

\- dados da peça

\- parâmetros CEP

&#x20;       ↓

Operador preenche V1..V5

&#x20;       ↓

Sistema calcula automaticamente:

\- Média (Xbar)

\- Amplitude (Range)

&#x20;       ↓

Operador adiciona observação (opcional)

&#x20;       ↓

Usuário clica em REGISTRAR

&#x20;       ↓

Sistema envia TODOS os dados atualizados ao ERP

&#x20;       ↓

ERP persiste os dados

&#x20;       ↓

Sistema atualiza gráficos em tempo real

```



\---



\# 4. Estrutura da Interface



\## Layout Geral



```text

┌─────────────────────────────────────────────────────────────┐

│ MENU ESQUERDO │ GRÁFICOS CENTRAIS │ MENU FIXO DIREITO │

└─────────────────────────────────────────────────────────────┘

```



\---



\# 5. Menu Inicial



\## Objetivo



Solicitar a Ordem de Produção antes de carregar a carta CEP.



\---



\## Componentes



| Campo | Tipo |

|---|---|

| Ordem de Produção | texto |

| Botão INICIAR | ação |



\---



\# 6. Integração Inicial com ERP



\## Requisição Inicial



Ao clicar em INICIAR, o sistema deve enviar:



```http

POST /erp/cep/load

```



\---



\## Payload enviado ao ERP



```json

{

&#x20; "op": "1958",

&#x20; "usuario": "OPERADOR\_001"

}

```



\---



\# 7. Resposta Esperada do ERP



O ERP deve retornar um JSON contendo:



\- informações completas da carta CEP

\- histórico dos gráficos

\- parâmetros estatísticos

\- dados do processo produtivo



\---



\## Exemplo de retorno



```json

{

&#x20; "op": "1958",

&#x20; "numeroCarta": "12345",

&#x20; "cp": 7.34,

&#x20; "cpk": 7.03,

&#x20; "numeroPeca": "MOLA-TRASEIRA-X",

&#x20; "equipamento": "PRENSA-05",

&#x20; "caracteristica": "DIÂMETRO EXTERNO",

&#x20; "sequencia": "010",

&#x20; "revisaoFicha": "REV-03",

&#x20; "setor": "MOLAS",

&#x20; "especificacao": "18.42 ±0.10",

&#x20; "cliente": "FIAT",

&#x20; "tamanhoAmostra": 5,

&#x20; "frequencia": "30min",

&#x20; "limitesControle": {

&#x20;   "xbar": {

&#x20;     "lsc": 18.52,

&#x20;     "media": 18.42,

&#x20;     "lic": 18.32

&#x20;   },

&#x20;   "range": {

&#x20;     "lsc": 0.45,

&#x20;     "media": 0.30,

&#x20;     "lic": 0.15

&#x20;   }

&#x20; },

&#x20; "historico": {

&#x20;   "xbar": \[

&#x20;     18.40,

&#x20;     18.37,

&#x20;     18.50

&#x20;   ],

&#x20;   "range": \[

&#x20;     0.30,

&#x20;     0.32,

&#x20;     0.39

&#x20;   ]

&#x20; }

}

```



\---



\# 8. Menu Esquerdo — Área Operacional



\## Objetivo



Permitir preenchimento manual das medições.



\---



\## Campos



| Campo | Tipo |

|---|---|

| Data | automático |

| Hora | automático |

| Operador | automático |

| V1 | numérico |

| V2 | numérico |

| V3 | numérico |

| V4 | numérico |

| V5 | numérico |

| Média (Xbar) | readonly |

| Amplitude (Range) | readonly |

| Observação | textarea |

| Botão REGISTRAR | ação |



\---



\# 9. Regras de Cálculo



\## Média (Xbar)



```math

X̄ = (V1 + V2 + V3 + V4 + V5) / 5

```



\---



\## Amplitude (Range)



```math

R = Valor Máximo - Valor Mínimo

```



\---



\# 10. Área Central — Gráficos CEP



\## Biblioteca



\- Chart.js



\---



\# Gráficos Necessários



\## Carta Xbar



Deve exibir:



\- médias registradas

\- linha central

\- LSC

\- LIC



\---



\## Carta Range



Deve exibir:



\- amplitudes registradas

\- linha central

\- LSC

\- LIC



\---



\# Funcionalidades dos Gráficos



| Recurso | Descrição |

|---|---|

| Atualização realtime | após registro |

| Histórico completo | até 25 pontos |

| Tooltip | dados detalhados |

| Destaque visual | pontos fora do limite |

| Scroll horizontal | opcional |



\---



\# 11. Menu Direito Fixo — Dados da Carta



\## Objetivo



Exibir informações vindas diretamente do ERP.



\---



\## Campos Visíveis



| Campo |

|---|

| Ordem de Produção |

| Nº Carta |

| CP |

| CPK |

| Nº Peça |

| Equipamento |

| Característica |

| Sequência |

| Revisão da Ficha |

| Setor |

| Especificação |

| Cliente |

| Tam. Amostra |

| Frequência |



\---



\# 12. Processo de Registro



\## Fluxo



Ao clicar em REGISTRAR:



1\. Sistema coleta:

&#x20;  - dados da carta recebidos do ERP

&#x20;  - novos valores digitados

&#x20;  - cálculos automáticos

&#x20;  - operador logado

&#x20;  - data/hora

&#x20;  - observação



2\. Sistema envia payload completo ao ERP



3\. ERP realiza persistência oficial dos dados



4\. ERP retorna novo histórico atualizado da carta CEP



5\. Frontend atualiza gráficos em tempo real



\---



\# Endpoint de Registro



```http

POST /erp/cep/register

```



\---



\# Payload Completo de Registro



```json

{

&#x20; "op": "1958",

&#x20; "numeroCarta": "12345",

&#x20; "usuario": "OPERADOR\_001",

&#x20; "dataHora": "2026-05-12T15:01:00",

&#x20; "numeroPeca": "MOLA-TRASEIRA-X",

&#x20; "equipamento": "PRENSA-05",

&#x20; "caracteristica": "DIÂMETRO EXTERNO",

&#x20; "cliente": "FIAT",

&#x20; "v1": 18.40,

&#x20; "v2": 18.42,

&#x20; "v3": 18.39,

&#x20; "v4": 18.41,

&#x20; "v5": 18.38,

&#x20; "media": 18.40,

&#x20; "range": 0.04,

&#x20; "observacao": "Peça dentro do padrão",

&#x20; "historicoAtualizado": {

&#x20;   "xbar": \[],

&#x20;   "range": \[]

&#x20; }

}

```



\---



\# 13. Arquitetura do Sistema



\## Modelo de Integração



O mini app CEP NÃO possuirá banco de dados próprio.



Toda persistência será centralizada exclusivamente no ERP.



O frontend atuará apenas como:



\- interface operacional

\- visualizador dos gráficos

\- cliente de integração API



\---



\## Fluxo Arquitetural



```text

Frontend React

&#x20;      ↓

API ERP

&#x20;      ↓

ERP Processa e Persiste Dados

```



\---



\# 14. Tecnologias Recomendadas



\## Frontend



| Tecnologia | Finalidade |

|---|---|

| React | Interface |

| TypeScript | Tipagem |

| TailwindCSS | Layout |

| Chart.js | Gráficos CEP |

| React Query | Integração API |

| Zustand | Estado global |



\---



\# 15. Requisitos Funcionais



| ID | Requisito |

|---|---|

| RF-01 | Solicitar OP inicial |

| RF-02 | Consultar ERP |

| RF-03 | Carregar dados da carta |

| RF-04 | Exibir gráficos históricos |

| RF-05 | Permitir preenchimento V1..V5 |

| RF-06 | Calcular média automaticamente |

| RF-07 | Calcular amplitude automaticamente |

| RF-08 | Permitir observação |

| RF-09 | Registrar medições |

| RF-10 | Enviar dados ao ERP |

| RF-11 | Atualizar gráficos em tempo real |



\---



\# 16. Requisitos Não Funcionais



| ID | Requisito |

|---|---|

| RNF-01 | Tema dark industrial |

| RNF-02 | Operação rápida |

| RNF-03 | Responsividade desktop |

| RNF-04 | Tempo de abertura < 2s |

| RNF-05 | Integração segura ERP |

| RNF-06 | Logs de auditoria |



\---



\# 17. Observações Técnicas



\## Responsabilidades do ERP



O ERP será responsável por:



\- persistência dos dados

\- cálculo Cp/Cpk

\- cálculo LSC/LIC

\- validações estatísticas

\- histórico da carta

\- regras de negócio

\- rastreabilidade



\---



\## Responsabilidades do Frontend



O frontend será responsável por:



\- renderização da interface

\- captura operacional

\- cálculos simples:

&#x20; - média

&#x20; - amplitude

\- visualização dos gráficos

\- integração via API com ERP

\- atualização realtime da tela



\---



\# 18. Observações Técnicas de UX



\## Melhorias Operacionais



\### Navegação rápida



```text

ENTER → próximo campo

```



\---



\### Registro rápido



```text

Ao finalizar V5:

ENTER → registrar automaticamente

```



\---



\## Recomendações Visuais



\- destacar pontos fora do limite em vermelho

\- melhorar contraste das linhas LIC/LSC

\- tooltip detalhado:

&#x20; - operador

&#x20; - data/hora

&#x20; - média

&#x20; - amplitude

