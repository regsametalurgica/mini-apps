# Documentação Técnica e Guia de Deploy - Portal Mini Apps (Ambiente Local)

Este documento detalha a arquitetura do projeto **Mini Apps (Regsa Metalúrgica)** para operação em rede local com conexão direta ao PostgreSQL.

---

## 1. Stack Tecnológica

O projeto utiliza uma arquitetura de **Cliente-Servidor Local**:

### Frontend
- **React 19 & TypeScript:** Utilização da versão mais recente do React para construção de interfaces e TypeScript para garantir segurança de tipos e melhor manutenção do código.
- **Vite:** Ferramenta de build de última geração que substitui o antigo *Create React App*, oferecendo HMR (Hot Module Replacement) instantâneo.
- **Tailwind CSS:** Framework de utilitários CSS para estilização rápida, garantindo um design responsivo e consistente.
- **Lucide React & Bootstrap Icons:** Conjuntos de ícones para uma interface intuitiva.

### Gestão de Estado e Dados
- **Zustand:** Gerenciamento de estado global leve e performático (visto no `package.json`).
- **TanStack Query (React Query):** Gerenciamento de cache, sincronização de dados e requisições assíncronas.
- **React Hook Form + Zod:** Manipulação de formulários com validação rigorosa de esquemas.

### Backend (Ponte de Dados)
- **Node.js + Express:** Servidor de API para conectar o frontend ao banco de dados.
- **node-postgres (pg):** Driver de conexão direta com o PostgreSQL da rede local.

### Banco de Dados
- **PostgreSQL:** Servidor rodando localmente na infraestrutura da empresa.

---

## 2. Requisitos e Conhecimentos Necessários

Para gerenciar e fazer o deploy deste projeto, a equipe técnica deve dominar:

1.  **Node.js:** Para rodar o frontend e a API.
2.  **SQL:** Para gerenciar o banco de dados PostgreSQL.
3.  **Rede Interna:** Configuração de IPs estáticos ou nomes de host para o servidor.

---

## 3. Preparação para Produção

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as credenciais do seu banco local:
```env
DB_HOST=192.168.x.x
DB_USER=usuario_regsa
DB_PASSWORD=senha_secreta
DB_NAME=mini_apps
DB_PORT=5432
VITE_API_URL=http://192.168.x.x:3000
```
*Nota: O prefixo `VITE_` é obrigatório para que as variáveis fiquem acessíveis no código.*

### Build do Projeto
O comando abaixo compila o código TypeScript em arquivos JavaScript puros, minificados e otimizados na pasta `/dist`:
```bash
npm run build
```

---

## 4. Estratégia de Deploy Local (Servidor Único)

A arquitetura de deploy consiste em executar tudo a partir de um único servidor **Node.js** operando na rede interna.

Este servidor Node.js (localizado na pasta `backend/`) é responsável por duas tarefas simultâneas:
1. **Disponibilizar a API REST:** Comunica-se diretamente com o PostgreSQL e atende às requisições do frontend.
2. **Servir os Arquivos Estáticos:** Entrega a interface de usuário (arquivos gerados na pasta `dist` após o build do Vite).

### Passos Principais

1. **Build do Frontend:** Execute `npm run build` para gerar a interface de usuário otimizada em `/dist`.
2. **Início do Servidor:** Execute `npm run start` para rodar o backend (`backend/server.js`), que automaticamente servirá a API e o frontend.

Desta forma, todo o sistema fica disponível em uma única porta (ex: 3000), facilitando o acesso interno pela rede da Regsa e dispensando configurações complexas como Nginx ou serviços externos.

---

## 5. Detalhes Importantes para Produção

- **PostgreSQL Local:** O banco de dados deve estar ativo na rede local e acessível pelo servidor Node.js com as credenciais configuradas no arquivo `.env`.
- **Porta Unificada:** Caso a porta 3000 (ou a definida no `.env`) esteja em uso, altere no `.env` para evitar conflitos.
- **Rede Local:** Garanta que o servidor que está rodando o Node.js tenha IP estático ou nome de host fixo para que outros computadores possam acessar os Mini Apps.
- **Segurança:** Nunca comite arquivos `.env` no repositório Git. Mantenha as senhas de banco seguras.

---
*Documentação atualizada em: 14/05/2026*
