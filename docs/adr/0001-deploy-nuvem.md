# ADR 0001 — Deploy em nuvem, Terraform e pipeline

- Status: **Aceito**
- Data: 2026-11-23

## Contexto
A conexão com o WhatsApp é um WebSocket permanente: plataformas que dormem derrubam a sessão.
Meta: custo zero. A cota Ampere A1 da OCI é incerta (o Rede Studio já recebeu "Out of host capacity")
e as VMs micro da OCI estão ocupadas pelo Rede Studio. Banco: Atlas free (banco novo no cluster existente).

## Decisão
| Tema | Escolha |
|---|---|
| Ambientes | **dev** = Docker Compose local · **prod** = GCP |
| Hospedagem prod | Compute Engine **e2-micro** (Always Free), `us-east1`, disco `pd-standard` 30 GB, swap 2 GB |
| Pilha no 1 GB | API e worker no **mesmo processo**; fila em **Redis + BullMQ** (sem RabbitMQ); Redis com `maxmemory 64mb`; Caddy (80/443); observabilidade só caminho A (Grafana Cloud) |
| Banco | MongoDB Atlas free (fora do GCP); IP estático da VM na allowlist |
| App inicial | o **legado atual** já roda nos dois ambientes; a migração (E2+) entra depois pela trilha Serviço |
| IaC | Terraform em `infra/` deste repo; estado remoto em bucket GCS com versionamento |
| Credencial do CI | Workload Identity Federation (OIDC), **sem chave JSON** |
| Acesso à VM | SSH só via IAP (`35.235.240.0/20`) com OS Login; sem SSH público |
| Segredos | Secret Manager; a VM lê na subida para `/opt/app/.env` (root, 600) |
| Imagens | GHCR, **linux/amd64** (e2-micro é x86), referência por digest |
| Branching | **Gitflow**: `feature/*`→`develop`; `release/*` e `hotfix/*`→`master`; prod só no merge de PR na `master` |
| Pipeline | trilhas condicionais Infra → Topologia → Serviço (ver `.claude/plans/ambientes-deploy/00-plano.md`) |
| Aprovação | environment `prod` no GitHub com você como revisor obrigatório (o GitHub não deixa aprovar o próprio PR) |

## Opções descartadas
| Opção | Motivo |
|---|---|
| OCI Ampere A1 | capacidade incerta em SP; decisão do dono por GCP |
| OCI Pay As You Go | exige upgrade de conta; não escolhido |
| VMs micro do Rede Studio | risco de derrubar o outro projeto |
| Render/Koyeb/Fly/Railway | dormem ou são pagos |

## Consequências
- 1 GB de RAM é o limite real: sem RabbitMQ, sem Prometheus local, Node com `--max-old-space-size=384`.
- Free tier: 1 e2-micro, 30 GB pd-standard e 1 GB de saída/mês (América do Norte). Snapshot e disco balanced são cobrados.
- **A verificar na primeira fatura:** cobrança de IPv4 externo. A doc do free tier diz que não cobra; a de VPC cobra IPv4 em uso desde 02/2024. Orçamento de R$ 1 com alerta detecta.
- Latência EUA↔Brasil (~120–150 ms) é aceitável para chat assíncrono.
- Passo a passo da conta: `docs/gcp-setup.md`.

## Evoluções registradas (não implementar sem nova decisão)

### E-01 — Cloudflare Free na frente da VM (DNS + proxy + WAF básico)
- **Quando:** ao ter domínio próprio, ou se o chat público sofrer abuso/DDoS que o rate limit da E5 não segure.
- **O quê:** domínio próprio (~US$ 10/ano) com DNS no Cloudflare Free, proxy ligado (DDoS, cache,
  conjunto gratuito de regras gerenciadas de WAF); DuckDNS sai.
- **Mudanças:** firewall da VPC libera 80/443 só para as faixas de IP publicadas pelo Cloudflare (lista
  mantida em variável do Terraform); Caddy passa a usar certificado de origem do Cloudflare ou
  desafio DNS-01; modo SSL "Full (strict)".
- **Por que não agora:** exige domínio pago, e as camadas atuais (firewall 80/443, Caddy com rotas
  públicas mínimas, gestão só via IAP, rate limit e captcha na E5) bastam para o volume de um portfólio.
- **Alternativas pagas descartadas:** Cloud Load Balancing (~US$ 18/mês) + Cloud Armor e Cloud DNS.
