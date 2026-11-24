# Fase 02 — Ambiente dev com Docker Compose

## Passos
1. Validar primeiro: escrever `scripts/smoke.sh` (sobe, espera healthchecks, `GET /status`) — falha hoje.
2. `Dockerfile` multi-stage: Node 24 LTS alpine, `yarn --frozen-lockfile`, usuário `node`,
   `HEALTHCHECK`, `NODE_OPTIONS=--max-old-space-size=384`, imagem linux/amd64. Lockfile passa a ser versionado
   (hoje está no `.gitignore`). Validar que o legado sobe no Node 24; se não, Node 22 LTS até a E2.
3. `docker-compose.yml` (dev): `api` (bind mount + nodemon; o worker roda no mesmo processo),
   `mongo`, `redis`, `otel-collector` (`profiles: [obs]`). Sem RabbitMQ (ADR 0001).
   Rede interna; só `api` exposta em 127.0.0.1:3333.
4. Healthcheck e `depends_on: condition: service_healthy` em todos; volumes nomeados para dados.
5. `.env.example` reorganizado por serviço, sem valores reais; remover `vercel.json` e `Procfile`.
6. `docker-compose.prod.yml` (override): imagem do GHCR por digest (`${APP_IMAGE}`), `restart: unless-stopped`,
   sem bind mount, sem `mongo` (Atlas), entra `caddy` (80/443, DuckDNS), `mem_limit` somando ≤ 700 MB
   (api 450, redis 96 com `maxmemory 64mb`, caddy 64, collector 90), `env_file: /opt/app/.env`.
7. Remover a montagem do volume `./:/home/node/app` e a variável `MONGODB_URL` hard-coded do Dockerfile.

## Saída esperada
- `Dockerfile` (alvos `dev` e `runtime`), `.dockerignore`, `docker-compose.yml` (base),
  `docker-compose.override.yml` (dev, carregado automaticamente), `docker-compose.prod.yml`,
  `deploy/Caddyfile`, `deploy/otel-collector.yaml`, `scripts/smoke.sh`, `yarn.lock` versionado.

## Checklist de saída (verificado por /fechar-fase em 2026-11-23)
- [x] `docker compose config` (dev) e config de prod (`ENV_FILE=.env.example APP_IMAGE=x DOMINIO=x ...`) sem erro
- [x] `scripts/smoke.sh` verde em dev (falhou antes, passou depois)
- [x] dev: portas só em 127.0.0.1 (3333 api, 27018 mongo); prod: só 80/443 públicos, api em 127.0.0.1:3333
- [x] Container roda como não-root (`node`) — dev e runtime
- [x] `yarn test` verde dentro do container (3 passing com PROTECT_ROUTES=true)
- [x] Imagem `runtime` amd64 saudável com rotas protegidas; sem devDependencies; 345 MB
- [x] Baileys 6.6 gera QR no Node 24 (init → qrbase64 → delete)
- [x] Nenhum erro de lint novo (baseline do legado: 9 erros, 19 warnings — fica para E2)
