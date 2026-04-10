# ── 1. Build frontend ───────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
# Install dependencies and build the Vite React app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# ── 2. Build backend deps ───────────────────────────────────
FROM node:20-alpine AS backend-deps
WORKDIR /app
COPY server/package.json ./
RUN npm install --omit=dev

# ── 3. Runtime stage ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy backend
COPY --from=backend-deps /app/node_modules ./node_modules
COPY server/server.js ./
COPY server/package.json ./

# Copy built frontend from stage 1 into the "dist" folder
COPY --from=frontend-builder /app/dist ./dist

USER appuser
EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "server.js"]
