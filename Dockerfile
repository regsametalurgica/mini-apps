# ==========================================================
# Dockerfile — CEP Integração Protheus
# Container único: Frontend (build estático) + Backend (Node)
# ==========================================================

# Estágio 1: Build do Frontend (React + Vite)
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio 2: Produção (Servidor Node.js)
FROM node:22-alpine
WORKDIR /app

# Copia apenas os arquivos necessários para produção
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Frontend compilado (servido como arquivos estáticos pelo Express)
COPY --from=build-stage /app/dist ./dist

# Backend (Express)
COPY --from=build-stage /app/backend ./backend

EXPOSE 3000

CMD ["npm", "run", "start"]
