# Deploy, Terraform e pipeline — decidido (ADR 0001)

Fonte de verdade: `docs/adr/0001-deploy-nuvem.md`. Passos manuais de conta: `docs/gcp-setup.md`.

## Resumo
- dev: Docker Compose (`api` com worker embutido, `mongo`, `redis`, `otel-collector` opcional).
- prod: GCP e2-micro `us-east1-b`, pd-standard 30 GB, swap 2 GB; Compose com `api`, `redis`, `caddy`, `otel-collector`;
  Mongo no Atlas. Imagens linux/amd64 no GHCR por digest.
- Acesso: SSH só via IAP + OS Login. CI autentica por WIF (sem chave). Segredos no Secret Manager → `/opt/app/.env`.
- Gitflow: `feature/*`→`develop` (só CI); `release/*`|`hotfix/*`→`master` dispara CD com aprovação no environment `prod`.

## Trilhas do CD
Infra (`infra/**`: terraform apply) → Topologia (`docker-compose.prod.yml`, `deploy/**`: sync + `compose up -d`)
→ Serviço (código: build, pull, restart só `api`, smoke, rollback automático).

## Limites que mandam no desenho (1 GB de RAM)
- Soma de `mem_limit` ≤ 700 MB; Node com `--max-old-space-size=384`; Redis `maxmemory 64mb`.
- Sem RabbitMQ, sem Prometheus local: observabilidade pelo caminho A (Grafana Cloud).
- Saída de rede ≤ 1 GB/mês no free tier; pull de imagem é entrada (grátis).

## Armadilhas de custo
Disco balanced/SSD, snapshot, segunda VM, região fora de us-east1/us-west1/us-central1, IP reservado sem uso.
Conferir IPv4 externo na primeira fatura.

## Evolução registrada
Cloudflare Free (DNS + proxy + WAF básico) com domínio próprio — ADR 0001, E-01. Não implementar sem nova decisão.
