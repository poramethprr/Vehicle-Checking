# Stage 1: Install deps and generate Prisma client
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

# Stage 2: Production image
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8007

# Run DB migration then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
