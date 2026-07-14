FROM node:20-alpine AS deps
WORKDIR /app

# Use a configurable npm registry (default is the public npmjs registry)
ARG NPM_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_REGISTRY=$NPM_REGISTRY

# Enable corepack and install dependencies with pnpm using the existing lockfile
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 2. Build the app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
