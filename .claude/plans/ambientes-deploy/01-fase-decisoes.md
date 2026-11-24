# Fase 01 — Decisões e checagem de capacidade

## Passos
1. Usuário roda a checagem de cota/capacidade A1 (3 comandos `oci` do plano) e informa o resultado.
2. Fechar no ADR 0001: provedor (OCI A1 | OCI PAYG | GCP e2-micro), local do Terraform, estado
   remoto, método de deploy e credencial do CI.
3. Definir app alvo destes ambientes: legado atual agora (recomendado) ou só após E2.
4. Atualizar `.claude/guias/deploy-infra.md` com o decidido (remover "EM ABERTO").

## Saída esperada
- `docs/adr/0001-deploy-nuvem.md` com status **Aceito**.

## Checklist de saída (verificado por /fechar-fase)
- [ ] ADR 0001 Aceito, com provedor e método de deploy
- [ ] Guia de deploy sem perguntas pendentes que bloqueiem as fases 02–04
