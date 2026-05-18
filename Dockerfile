# Estágio de Build do Frontend
FROM node:18-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de Produção (Servidor Node)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/backend ./backend
COPY --from=build-stage /app/.env.example ./.env

EXPOSE 3000
CMD ["npm", "run", "start"]
