# Fase 04 — Pipeline com trilhas condicionais

## Passos
1. `ci.yml` (pull_request → `develop` e `master`): lint, testes, gitleaks, build da imagem + Trivy;
   job `gitflow`: PR para `master` só de `release/*` ou `hotfix/*`;
   se `infra/**` mudou: fmt/validate/tflint + `terraform plan -lock=false` com `gh-plan` (WIF) comentado no PR.
2. `cd.yml` (push → `master`, ou seja, PR mergeado): job `changes` com `dorny/paths-filter`
   classifica em `infra`, `topologia`, `servico` (regras na tabela do 00-plano).
3. Todos os jobs de escrita usam `environment: prod` (sua aprovação) e WIF (`google-github-actions/auth`);
   o subject `environment:prod` é o único aceito pelas contas `gh-terraform`/`gh-deploy`.
4. Job `infra` (se infra): `terraform apply` com `gh-terraform`.
5. Job `topologia` (se infra ou topologia; `needs: infra` quando houver): `gcloud compute scp/ssh --tunnel-through-iap`
   copia `docker-compose*.yml` e `deploy/` para `/opt/app` e roda `docker compose up -d --remove-orphans`.
6. Job `servico` (se servico; depois dos anteriores): build linux/amd64 → GHCR com tag de commit e digest;
   via IAP: `scripts/deploy.sh <digest>` = pull + `up -d --no-deps api` + smoke em `/status`;
   smoke falhou → `scripts/rollback.sh` volta ao digest anterior (guardado em `/opt/app/.digest-anterior`).
7. Tag `vX.Y.Z` criada no merge de `release/*` (gitflow); `develop` recebe back-merge de `master` após hotfix.
8. `concurrency: prod` (um deploy por vez); actions fixadas por SHA; `permissions` mínimas por job
   (`id-token: write` só onde há WIF, `packages: write` só no build).
9. Remover `node.js-test.yml` (Node 16, branch `main`) e revisar `format.yml`/`codeql-analysis.yml`/`stale.yml`.

## Saída esperada
- `.github/workflows/{ci,cd}.yml`, `scripts/{deploy,rollback}.sh`, seção "Fluxo de release" no runbook.

## Checklist de saída (verificado por /fechar-fase)
- [ ] PR `feature/*`→`develop`: só CI, nenhum deploy
- [ ] PR `develop`→`master` é recusado pelo job `gitflow`; `release/*`→`master` passa
- [ ] Merge só de código: CD roda apenas `servico`; redis/caddy com o mesmo uptime de antes
- [ ] Merge com `deploy/` ou compose prod: roda `topologia` (+ `servico` se houver código)
- [ ] Merge com `infra/`: plan no PR; apply só após aprovação no environment `prod`
- [ ] Merge só de docs/testes: nenhuma trilha de deploy roda
- [ ] Rollback automático testado com smoke forçado a falhar
- [ ] `actionlint` limpo
