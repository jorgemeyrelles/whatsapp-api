# Fase 05 — Revisão, segurança e runbook

## Passos
1. `/analise-seguranca projeto` focando Docker, CI, Terraform e segredos; corrigir Críticas/Altas.
2. `/analise-arquitetura .claude/plans/ambientes-deploy` contra ADR 0001.
3. `/revisao` do diff da branch.
4. Escrever `docs/operacao.md`: subir dev, primeiro apply, rotacionar segredo, deploy manual,
   rollback, recriar VM sem novo QR (sessão no Atlas), checagem de ociosidade.
5. Marcar E6 no roadmap (parcial: observabilidade fica na E7).

## Checklist de saída (verificado por /fechar-fase)
- [ ] Nenhum achado Crítico/Alto aberto
- [ ] Runbook cobre os 7 procedimentos acima
- [ ] Roadmap e guia de deploy atualizados
