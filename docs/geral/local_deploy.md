# Guia de Instalação e Deploy do Sistema

Este guia explica de forma simples e direta como rodar o **Projeto Mini Apps** no seu computador local (para testes/desenvolvimento) e como subir para o seu Servidor Linux de Produção.

---

## 💻 1. Rodando no seu Computador (Ambiente Local)

Essa é a forma mais fácil para você abrir o sistema na sua máquina e testar tudo.

1. **Abra o terminal na pasta do projeto** (`mini-apps`).
2. **Instale as dependências** rodando:
   ```bash
   npm install
   ```
3. **Configure o banco de dados e segredos:** 
   Certifique-se de que existe um arquivo chamado `.env` na pasta principal do projeto. Dentro dele, coloque os dados do seu banco:
   ```env
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=miniapps
   DB_PORT=5432
   JWT_SECRET=sua_chave_secreta
   ```
   *(As configurações do Protheus/ERP são feitas depois, diretamente dentro do Painel Admin na tela, não precisam ficar aqui)*

4. **Inicie o sistema!**
   Abra dois terminais na pasta do projeto e rode:
   - No Terminal 1: `npm run dev:frontend` *(Isso vai subir a interface gráfica)*
   - No Terminal 2: `npm run dev:backend` *(Isso vai subir a API do sistema)*

---

## 🐧 2. Subindo para o Servidor Oficial (Linux / Ubuntu)

Para colocar o sistema no ar para os usuários acessarem de verdade, você precisará copiar os arquivos do seu computador para o servidor.

### Quais pastas e arquivos eu devo enviar para o servidor?
Você **NÃO** precisa enviar tudo. Envie apenas o essencial:
- Pasta `backend/` *(Todo o código do servidor)*
- Pasta `dist/` *(O frontend depois de compilado)*
- Arquivo `package.json` e `package-lock.json`
- Arquivo `.env` *(Com as credenciais reais do servidor de banco de dados)*

*(Se a pasta `dist/` não existir, você deve rodar `npm run build` no seu computador antes de copiar os arquivos)*

### Onde colocar no servidor?
1. Crie uma pasta no servidor, o local recomendado é: **`/var/www/mini-apps`**
2. Jogue todos os arquivos listados acima dentro dessa pasta.

### Como rodar lá no servidor?
Acesse a pasta no servidor e rode os seguintes comandos:

1. **Instale as bibliotecas:**
   ```bash
   npm install --production
   ```
2. **Ligue o servidor em "Plano de Fundo" (usando o PM2):**
   O PM2 é um gerenciador que mantém o seu sistema rodando 24h por dia, mesmo se o servidor reiniciar.
   *(Se não tiver o PM2 instalado, rode: `sudo npm install -g pm2`)*
   
   Rode os seguintes comandos para ligar:
   ```bash
   pm2 start backend/server.js --name "mini-apps"
   pm2 save
   pm2 startup
   ```

**Pronto!** O seu sistema já estará rodando na porta `3000` do IP do seu servidor.

---

## 🐳 3. Usando o Docker (Opcional - Mais Rápido)

Se você prefere subir tudo de uma vez usando Docker, jogue toda a pasta do projeto no servidor e simplesmente rode:
```bash
docker-compose up -d --build
```
Isso vai criar automaticamente o banco de dados e ligar o sistema sem precisar instalar nada manualmente.

---
*Documentação atualizada em: 27/05/2026*
