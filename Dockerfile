# ─── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
# Force development mode so devDependencies (vite, etc.) are always installed
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Install only production dependencies for the server
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy server source
COPY server/ ./server/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

# Start nginx + node server
CMD ["sh", "-c", "node server/index.js & nginx -g 'daemon off;'"]
