# Fase 03 — Infraestrutura prod em Terraform

## Passos
1. Pré-requisito: usuário executou `docs/gcp-setup.md` passos 1–10 (projeto, orçamento, bucket, SAs, WIF, segredos).
2. Estrutura: `infra/modules/{rede,vm,segredos,alertas}` · `infra/envs/prod/{main,variables,outputs,versions}.tf`
   · backend `gcs` (bucket via `-backend-config`) · `prod.tfvars.example` (o real no `.gitignore`).
3. `rede`: VPC própria + subnet `us-east1`; firewall 80/443 de `0.0.0.0/0`; 22 **só** de `35.235.240.0/20` (IAP);
   IP externo estático **em uso** pela VM.
4. `vm`: `e2-micro`, `us-east1-b`, imagem Debian 12, disco `pd-standard` 30 GB, `enable-oslogin=TRUE`,
   Shielded VM, conta de serviço própria (`roles/secretmanager.secretAccessor` + `logging.logWriter`),
   `gh-deploy` com `iam.serviceAccountUser` nela; `lifecycle.ignore_changes` em metadata de startup ao mudar só app.
5. `startup-script`: swap 2 GB, Docker + compose plugin, `/opt/app`, lê segredos do Secret Manager →
   `/opt/app/.env` (600, root) junto com os valores não secretos (`APP_URL=https://<DOMINIO>`, `PROTECT_ROUTES=true`,
   `NODE_ENV=production`), atualiza DuckDNS, `docker compose up -d`.
6. `segredos`: só referências/IAM dos secrets criados no passo 7 do setup (valores fora do Terraform).
7. `alertas`: canal de e-mail + uptime check em `/status` + alerta de VM parada (Cloud Monitoring, gratuito).
8. Validar antes de aplicar: `terraform fmt -check`, `validate`, `tflint`, `trivy config infra/`.

## Saída esperada
- `infra/` completo; primeiro `apply` feito pelo usuário (setup passo 11); outputs `ip_externo`, `vm_nome`.

## Checklist de saída (verificado por /fechar-fase)
- [ ] `fmt`, `validate`, `tflint` e `trivy config` limpos
- [ ] Nenhum segredo em `.tf`/`.tfvars` versionado; `*.tfvars`, `.terraform/`, `*.tfstate*` no `.gitignore`
- [ ] Recursos só dentro do Always Free (1 e2-micro, pd-standard ≤ 30 GB, us-east1, sem snapshot)
- [ ] Segundo `plan` sem diff
- [ ] SSH só via IAP; `curl https://<dominio>/status` = OK
