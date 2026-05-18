# Instruções de Deploy - Ambiente Local e Produção

Este guia descreve os passos necessários para configurar e executar o **Projeto Mini Apps** em ambiente local, servidor Linux ou via Docker.

---

## 💻 1. Implementação em Ambiente Local (Windows/Mac/Linux)

Ideal para desenvolvimento e testes rápidos.

1. **Instalar Dependências:**
   ```bash
   npm install
   ```
2. **Configurar Variáveis:** Crie o arquivo `.env` baseado no `.env.example`.
3. **Iniciar Desenvolvimento:**
   * **Frontend:** `npm run dev:frontend` (Porta 5173)
   * **Backend:** `npm run dev:backend` (Porta 3000)

---

## 🐧 2. Deploy em Servidor Linux (Ubuntu Server)

Recomendado para servidores físicos ou VMs na rede interna.

### Pré-requisitos
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm postgresql -y
sudo npm install -g pm2
```

### Passo a Passo
1. **Clonar/Copiar o Projeto:** Navegue até `/var/www/mini-apps`.
2. **Build do Frontend:**
   ```bash
   npm install
   npm run build
   ```
3. **Gerenciar Processos com PM2:**
   O PM2 garante que o servidor reinicie automaticamente em caso de falha ou reboot do servidor.
   ```bash
   pm2 start backend/server.js --name "mini-apps"
   pm2 save
   pm2 startup
   ```
4. **Acesso:** A aplicação estará disponível na porta `3000` do IP do servidor.

---

## 🐳 3. Deploy via Docker (Simplificado com Persistência)

A maneira mais rápida e isolada de rodar a aplicação com banco de dados incluso.

### Estrutura
O projeto inclui um `Dockerfile` e um `docker-compose.yml` prontos para uso.

### Como Subir
1. **Certifique-se de ter o Docker e Docker Compose instalados.**
2. **Executar o comando:**
   ```bash
   docker-compose up -d --build
   ```

### Detalhes do Container
* **Persistência:** O volume `pgdata` garante que os dados do PostgreSQL não sejam perdidos se o container for removido.
* **Rede:** A aplicação expõe a porta `3000` (Web) e `5432` (Banco de Dados).
* **Logs:** Para acompanhar o que está acontecendo: `docker-compose logs -f`.

### Comandos Úteis
* **Parar tudo:** `docker-compose down`
* **Reiniciar App:** `docker-compose restart app`

---

## ⚙️ Variáveis de Ambiente Necessárias
Certifique-se de que o `.env` contenha as seguintes chaves configuradas corretamente para o seu ambiente:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET` (Para autenticação)
- `PROTHEUS_API_URL` (Para integração ERP)

---
*Documentação atualizada em: 15/05/2026*
