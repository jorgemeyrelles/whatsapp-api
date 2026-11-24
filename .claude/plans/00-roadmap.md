# Roadmap do upgrade

Fonte: doc "WhatsApp API: plano de melhoria e atendente virtual com LLM". Gitflow: `feature/*`→`develop`; `release/*`|`hotfix/*`→`master` (= produção).

**Ordem combinada com o usuário (2026-11-24):** E1–E5 inteiras em **dev** (TS + Nest, Baileys 7, fila, atendente com as API keys de LLM) e validadas lá; só então E6 (Terraform, GCP, prod).

## Etapas
- [ ] E0 Decisões sem código — chip do número, textos da base, frase de recusa, logo/crédito/README
- [ ] E1 Rede de segurança — testes das rotas atuais + ~30 conversas gravadas em `tests/conversas/`
- [ ] E2 Base nova — Node 24, TS strict ESM, NestJS + Zod, Docker Compose, CI atualizado (rotas iguais)
- [ ] E3 Canal — Baileys 7 atrás de `Channel`, sessão em coleção única, LID, backoff, `mongodump` antes
- [ ] E4 Fila e estado — Redis + BullMQ (ADR 0001: sem RabbitMQ no 1 GB), dedup, rate limit alinhado à cota
- [ ] E5 Atendente — agente simples (baseline) → harness com Groq + Gemini → widget/SSE
- [ ] E6 Deploy, Terraform e pipeline — plano `ambientes-deploy`; GCP e2-micro (ADR 0001 aceito)
- [ ] E7 Observabilidade — OTel + Collector, caminho A ou B
- [ ] E8 Piloto de medição — tokens, latência, % por regra, escalonamentos; substituir estimativas

## Tarefas ativas
<!-- /nova-tarefa adiciona aqui: - [slug](slug/00-plano.md) — etapa — fase atual -->
- [ambientes-deploy](ambientes-deploy/00-plano.md) — E6 (+ Compose da E2) — **pausada** após a fase 02 (Compose dev pronto); fases 03–05 só depois de E5 validada em dev
- próxima: E0 (decisões do usuário) e E1 (rede de segurança) → abrir com `/nova-tarefa`

## Concluídas
