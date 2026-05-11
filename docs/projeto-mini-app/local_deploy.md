# Instruções de Deploy - Ambiente Local

Este guia descreve os passos necessários para configurar e executar o **Projeto Mini Apps** em um ambiente de desenvolvimento local.

## Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

1. **Node.js**: É recomendada a versão LTS atual (v18 ou superior).
   - Verifique a instalação executando: `node -v`
2. **NPM** (Node Package Manager) ou **Yarn**: Instalado juntamente com o Node.js.
   - Verifique a instalação executando: `npm -v`

---

## Passo a Passo para Execução Local

### 1. Obter o Código Fonte
Certifique-se de que você está no diretório raiz do projeto. Caso tenha clonado o repositório, navegue até a pasta:
```bash
cd caminho/para/o/projeto-mini-apps
```

### 2. Instalar Dependências
O projeto utiliza diversas bibliotecas externas (como React, TailwindCSS, etc.). Você precisa baixar essas dependências para a pasta `node_modules`.

Execute o seguinte comando no terminal, dentro da raiz do projeto:
```bash
npm install
```
*(Aguarde o download e a instalação de todos os pacotes listados no `package.json`)*.

### 3. Configurar Variáveis de Ambiente (Se aplicável)
Neste momento inicial, se o projeto depender de APIs externas para funcionar completamente, crie um arquivo `.env` na raiz do projeto copiando o modelo `.env.example` (se existir).

```bash
cp .env.example .env
```
*(Ajuste os valores dentro do `.env` conforme os URLs locais do seu backend, se necessário)*.

### 4. Iniciar o Servidor de Desenvolvimento
Com as dependências instaladas, você já pode iniciar o servidor local do Vite, que possui _Hot Module Replacement_ (HMR) - as mudanças no código refletem instantaneamente no navegador.

Execute:
```bash
npm run dev
```

### 5. Acessar a Aplicação
O terminal exibirá uma mensagem indicando que o servidor está rodando, geralmente na porta `5173`.

- Abra o seu navegador web (Chrome, Firefox, Edge, etc).
- Acesse a URL: **http://localhost:5173** (ou a URL informada no terminal).

---

## Comandos Adicionais Úteis

- **Build para Produção**: Quando quiser gerar os arquivos finais otimizados para deploy em um servidor real.
  ```bash
  npm run build
  ```
  *(Os arquivos gerados ficarão na pasta `dist`)*

- **Visualizar o Build Localmente**: Para testar a versão de produção gerada no passo anterior.
  ```bash
  npm run preview
  ```
