# syntax=docker/dockerfile:1
# Uma imagem, dois alvos: `dev` (com devDependencies e nodemon) e `runtime` (produção, padrão).
ARG NODE_VERSION=24

FROM node:${NODE_VERSION}-bookworm-slim AS base
WORKDIR /app
# git: o Baileys 6 baixa o libsignal direto do GitHub
RUN apt-get update \
 && apt-get install -y --no-install-recommends git ca-certificates \
 && rm -rf /var/lib/apt/lists/*

FROM base AS deps-prod
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --non-interactive && yarn cache clean

FROM base AS dev
ENV NODE_ENV=development
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive && yarn cache clean
COPY --chown=node:node . .
USER node
EXPOSE 3333
CMD ["yarn", "dev"]

FROM node:${NODE_VERSION}-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=384
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node src ./src
USER node
EXPOSE 3333
# /status exige o bearer token quando PROTECT_ROUTES=true; o healthcheck usa o TOKEN do próprio container
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3333)+'/status',{headers:{authorization:'Bearer '+(process.env.TOKEN||'')}}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "src/server.js"]
