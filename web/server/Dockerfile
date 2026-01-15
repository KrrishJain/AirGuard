# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app

# pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

# install only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# copy source (keep .dockerignore clean)
COPY . .

USER node

EXPOSE 5000
CMD ["pnpm","start"]
