FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# tsx handles ESM module resolution without requiring .js extensions in imports
RUN npm install tsx

EXPOSE 3001

CMD ["npx", "tsx", "dist/server.js"]
