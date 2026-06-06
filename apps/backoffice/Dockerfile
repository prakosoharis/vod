FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install express http-proxy-middleware

COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 3006

CMD ["node", "server.js"]
