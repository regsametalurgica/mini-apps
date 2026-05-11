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

Para trabalhar no desenvolvimento da aplicação (Frontend + Backend local):

1. **Frontend (React/Vite):** Abra um terminal e execute:
   ```bash
   npm run dev:frontend
   ```
   *(Isto iniciará o Vite na porta 5173 com Hot Module Replacement).*

2. **Backend (Node.js/Express):** Abra outro terminal e execute:
   ```bash
   npm run dev:backend
   ```
   *(Isto iniciará a API, geralmente na porta 3000).*

### 5. Acessar a Aplicação (Modo Dev)

- Abra o seu navegador e acesse a URL: **http://localhost:5173** para visualizar o frontend.
- O frontend se comunicará com o backend localmente na porta 3000 (conforme configurado no seu `.env`).

---

## Deploy em Produção (Ambiente Local da Rede)

Para colocar a aplicação no ar para os usuários da rede interna da empresa, você utilizará o servidor Node.js unificado.

1. **Gere o Build de Produção:**
   Isso compilará o frontend para a pasta `dist`.
   ```bash
   npm run build
   ```

2. **Inicie o Servidor Único:**
   O script abaixo inicializa o backend, que também servirá os arquivos estáticos recém-criados.
   ```bash
   npm start
   ```

3. **Acesso Final:**
   A aplicação completa (API + Interface) estará disponível na porta configurada (ex: **http://localhost:3000**). Este é o IP e a porta que você deve compartilhar com os usuários na rede.
