# Stage 1: Build Vue.js app
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build-time env vars (Vite bakes these into the bundle at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# Stage 2: Serve static files
FROM node:24-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

RUN npm install -g serve

EXPOSE 3007

CMD ["serve", "-s", "dist", "-l", "3007"]
