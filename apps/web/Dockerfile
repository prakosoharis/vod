FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
# Use npm install (not ci) to resolve platform-specific native bindings for rolldown
RUN npm install

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_WS_URL=ws://localhost:3002

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npx vite build

FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
