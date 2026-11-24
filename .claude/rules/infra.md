---
paths:
  - "infra/**"
  - ".github/workflows/**"
  - "docker-compose*.yml"
  - "Dockerfile"
---
# Infra e pipeline (checklist)

- [ ] Só implementar o que está em ADR com status **Aceito** em `docs/adr/`
- [ ] Terraform: estado remoto, `terraform fmt`/`validate` no CI, nenhum segredo em `.tf`/`.tfvars` versionado
- [ ] Só recursos do Always Free GCP (1 e2-micro, pd-standard ≤ 30 GB, us-east1); orçamento com alerta ativo
- [ ] CI: testes + conversas gravadas + lint + gitleaks + Trivy antes de publicar imagem
- [ ] Imagem linux/amd64 no GHCR com tag de commit; deploy referencia digest
- [ ] Trilha Serviço recria só `api`; Redis, Caddy e sessão WhatsApp não são recriados
- [ ] CI autentica por WIF (sem chave JSON); jobs de escrita só no environment `prod`
- [ ] SSH só via IAP; nenhuma regra de firewall com 22 aberto para a internet
- [ ] Versões de actions fixadas por SHA; Node do CI = Node do Dockerfile
