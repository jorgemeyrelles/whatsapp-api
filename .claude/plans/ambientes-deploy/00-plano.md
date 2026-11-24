# Plano — Ambientes dev/prod, Terraform e pipeline de deploy

Etapa do roadmap: E6 (antecipa a parte de Compose da E2) · Branch: `feature/ambientes-deploy` (gitflow → `develop` → `release/*` → `master`)

## Objetivo
Dois ambientes com os mesmos containers: **dev** em Docker Compose local e **prod** numa e2-micro do GCP
provisionada por Terraform, rodando já o app legado. Pipeline com três trilhas acionadas pelo merge de PR na `master`.

## Escopo
- Dentro: Dockerfile multi-stage, `docker-compose.yml` (dev) + `docker-compose.prod.yml` (override),
  `infra/` Terraform (rede/firewall, VM, Secret Manager, IAM, alertas), workflows GitHub Actions,
  scripts de deploy e rollback, runbook.
- Fora: migração para TS/NestJS (E2), Baileys 7 (E3), código de fila/harness (E4/E5), painel de observabilidade (E7).

## Decisões (ADR 0001 aceito em 2026-11-23)
- Dev = Docker Compose; prod = GCP e2-micro (1 GB) em `us-east1`, Terraform, WIF, IAP, Secret Manager.
- Pilha enxuta: API + worker no mesmo processo, fila Redis/BullMQ, sem RabbitMQ.
- Gitflow; prod só no merge de PR `release/*`|`hotfix/*` → `master`, com aprovação no environment `prod`.
- Conta: `docs/gcp-setup.md` (passos manuais do usuário).

## As três trilhas do pipeline (merge na master)
| Mudou | Trilha | O que roda em prod |
|---|---|---|
| `infra/**` | **Infra** | `terraform plan` no PR → `apply` após merge, com aprovação manual (environment `prod`) → em seguida trilha Topologia |
| `docker-compose.yml`, `docker-compose.prod.yml`, `deploy/**` (Caddy, Collector) | **Topologia** | sincroniza arquivos na VM e `docker compose up -d` (recria só serviços cuja definição mudou) |
| só código (`src/**`, `package.json`, `Dockerfile`, `conhecimento/**`) | **Serviço** | build amd64 → GHCR (por digest) → pull + restart só de `api` e `worker` |
Ordem quando várias mudam: Infra → Topologia → Serviço. Docs/testes/`.claude/` sozinhos → nenhuma trilha.

## Pronto quando
- `docker compose up -d` sobe todos os serviços saudáveis e `GET /status` = OK em dev.
- `terraform plan` em `infra/envs/prod` sem diff após o apply inicial; estado remoto travado.
- PR só de código → apenas `api`/`worker` reiniciados (verificado pelo log do job e `docker ps`).
- PR em `infra/` → plan comentado no PR; apply só após merge + aprovação.
- Rollback para o digest anterior em 1 comando documentado.

## Ler antes (só estes)
- rules: `.claude/rules/infra.md`, `.claude/rules/seguranca.md`
- guias: `.claude/guias/deploy-infra.md`, `docs/adr/0001-deploy-nuvem.md`, `docs/gcp-setup.md` (fases 03–04)

## Fases
- [x] 01 — decisões e checagem de capacidade (`01-fase-decisoes.md`)
- [x] 02 — ambiente dev com Compose (`02-fase-dev-compose.md`)
- [ ] 03 — infraestrutura prod em Terraform — **pausada: só após E1–E5 validadas em dev** (`03-fase-terraform.md`)
- [ ] 04 — pipeline com trilhas condicionais (`04-fase-pipeline.md`)
- [ ] 05 — revisão, segurança e runbook (`05-fase-revisao.md`)

## Perguntas em aberto
- Usuário executar `docs/gcp-setup.md` passos 1–10 antes da fase 03 (o apply é o passo 11).

## Notas para a próxima sessão
- Fase 01 fechada: ADR 0001 aceito (GCP e2-micro, gitflow).
- Fase 02 fechada (branch local `feature/ambientes-deploy`, sem commit). Dev: `scripts/smoke.sh`.
  Compose em 3 arquivos: base + override (dev, automático) + prod. Prod valida com `ENV_FILE=.env.example`.
- Baileys fixado em `6.6.0`: `^6.6.0` resolvia 6.17.16, que removeu `PHONENUMBER_MCC` (usado no registro mobile).
- Com PROTECT_ROUTES=true, `/status` exige bearer: healthcheck usa o TOKEN do container; uptime check público
  (fase 03) vai receber 403 — usar check de TCP/443 ou criar rota pública `/health` na E2.
- Hook post-edit-lint vai acusar os erros antigos ao editar arquivos do legado (mongoClient global) — esperado.
- Cloudflare registrado como evolução E-01 no ADR 0001.
- Conexão do número por link de uso único (decisão do usuário): `POST /instance/connect-link` → `/conectar/<token>`
  (público no Caddy). Prod precisa `APP_URL=https://<DOMINIO>` no Secret Manager/.env. QR no terminal foi descartado.
- Próximo: fase 03 (Terraform) — exige `docs/gcp-setup.md` passos 1–10 feitos pelo usuário.
- e2-micro é x86 → imagens linux/amd64. Disco tem de ser pd-standard.
- Conferir cobrança de IPv4 externo na primeira fatura (doc do free tier vs. doc de VPC divergem).
