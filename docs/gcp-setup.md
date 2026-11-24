# Configuração da conta GCP, GitHub e Atlas

Passo a passo para preparar o ambiente de produção antes do primeiro `terraform apply`. Siga na ordem.
Tudo que é manual está aqui; o restante da infraestrutura é criado pelo Terraform em `infra/`.

**Tempo estimado:** 40–60 min. **Custo esperado:** R$ 0 (dentro do Always Free), confirmado pelo alerta de orçamento.

## 0. Pré-requisitos na sua máquina

```bash
# Google Cloud CLI: https://cloud.google.com/sdk/docs/install
gcloud version
terraform version    # >= 1.9
gh --version         # GitHub CLI, logado: gh auth status
```

Defina as variáveis usadas nos passos (troque o sufixo por algo único seu, só minúsculas e números):

```bash
export PROJECT=whatsapp-api-<sufixo>
export REGION=us-east1
export ZONE=us-east1-b
export REPO=jorgemeyrelles/whatsapp-api
```

## 1. Conta e faturamento

1. Acesse https://console.cloud.google.com com a conta Google que será dona do projeto.
2. Ative o faturamento: **Faturamento → Criar conta de faturamento**, com cartão. O GCP exige
   cartão mesmo para o Always Free; nada é cobrado enquanto o uso ficar dentro dos limites.
3. Se aparecer a oferta de teste (crédito de 90 dias), pode aceitar. O Always Free continua valendo
   depois do fim do teste, mas **só se você não deixar recursos pagos ligados**.

```bash
gcloud auth login
gcloud billing accounts list          # anote o ACCOUNT_ID
export BILLING=<ACCOUNT_ID>
```

## 2. Projeto

```bash
gcloud projects create "$PROJECT" --name="whatsapp-api"
gcloud billing projects link "$PROJECT" --billing-account="$BILLING"
gcloud config set project "$PROJECT"
gcloud config set compute/region "$REGION"
gcloud config set compute/zone "$ZONE"

gcloud services enable \
  compute.googleapis.com iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  secretmanager.googleapis.com iap.googleapis.com storage.googleapis.com \
  cloudresourcemanager.googleapis.com serviceusage.googleapis.com \
  billingbudgets.googleapis.com monitoring.googleapis.com oslogin.googleapis.com
```

## 3. Proteção contra cobrança (faça antes de criar qualquer recurso)

```bash
# A moeda tem de ser a da conta de faturamento (BRL ou USD)
gcloud billing budgets create \
  --billing-account="$BILLING" \
  --display-name="whatsapp-api custo zero" \
  --budget-amount=1BRL \
  --filter-projects="projects/$PROJECT" \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=1.0
```

- O orçamento **só alerta, não bloqueia**. Os alertas chegam por e-mail aos administradores do faturamento.
- O que sai do Always Free e gera cobrança: mais de uma VM, tipo diferente de e2-micro, região fora de
  `us-east1`/`us-west1`/`us-central1`, disco `pd-balanced`/`pd-ssd`, mais de 30 GB, snapshots,
  saída de rede acima de 1 GB/mês e IP estático **reservado sem uso**.

## 4. Bucket do estado do Terraform

```bash
gcloud storage buckets create "gs://$PROJECT-tfstate" \
  --location="$REGION" --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update "gs://$PROJECT-tfstate" --versioning
```

Fica dentro dos 5 GB gratuitos do Cloud Storage em região dos EUA. O estado tem poucos KB.

## 5. Contas de serviço do pipeline (uma por papel)

| Conta | Usada por | Pode |
|---|---|---|
| `gh-plan` | CI em PR | ler o projeto e o estado (`terraform plan`) |
| `gh-terraform` | CD, trilha Infra (environment `prod`) | criar e alterar a infraestrutura |
| `gh-deploy` | CD, trilhas Topologia e Serviço (environment `prod`) | abrir SSH via IAP e reiniciar containers |

```bash
for sa in gh-plan gh-terraform gh-deploy; do
  gcloud iam service-accounts create "$sa" --display-name="$sa"
done
SA() { echo "$1@$PROJECT.iam.gserviceaccount.com"; }

# gh-plan: somente leitura
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$(SA gh-plan)" --role=roles/viewer
gcloud storage buckets add-iam-policy-binding "gs://$PROJECT-tfstate" \
  --member="serviceAccount:$(SA gh-plan)" --role=roles/storage.objectViewer

# gh-terraform: administra a infraestrutura deste projeto
for role in roles/compute.admin roles/iam.serviceAccountAdmin roles/iam.serviceAccountUser \
            roles/secretmanager.admin roles/resourcemanager.projectIamAdmin roles/monitoring.editor; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$(SA gh-terraform)" --role="$role"
done
gcloud storage buckets add-iam-policy-binding "gs://$PROJECT-tfstate" \
  --member="serviceAccount:$(SA gh-terraform)" --role=roles/storage.objectAdmin

# gh-deploy: SSH via IAP com sudo (para o docker), nada mais
for role in roles/iap.tunnelResourceAccessor roles/compute.osAdminLogin roles/compute.viewer; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$(SA gh-deploy)" --role="$role"
done
# A permissão iam.serviceAccountUser sobre a conta de serviço da VM é concedida pelo Terraform.
```

## 6. Workload Identity Federation (GitHub sem chave JSON)

```bash
gcloud iam workload-identity-pools create github --location=global --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc github-repo \
  --location=global --workload-identity-pool=github \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
  --attribute-condition="assertion.repository=='$REPO'"

POOL=$(gcloud iam workload-identity-pools describe github --location=global --format='value(name)')

# PRs só conseguem usar a conta de leitura
gcloud iam service-accounts add-iam-policy-binding "$(SA gh-plan)" --role=roles/iam.workloadIdentityUser \
  --member="principal://iam.googleapis.com/$POOL/subject/repo:$REPO:pull_request"

# Só jobs do environment prod (que exige sua aprovação) usam as contas de escrita
for sa in gh-terraform gh-deploy; do
  gcloud iam service-accounts add-iam-policy-binding "$(SA $sa)" --role=roles/iam.workloadIdentityUser \
    --member="principal://iam.googleapis.com/$POOL/subject/repo:$REPO:environment:prod"
done

# Anote para o GitHub:
gcloud iam workload-identity-pools providers describe github-repo \
  --location=global --workload-identity-pool=github --format='value(name)'
```

Com isso, um fork ou uma branch qualquer não consegue alterar a produção: o token só vale para jobs
do environment `prod`, e esse environment só roda depois da sua aprovação.

## 7. Segredos no Secret Manager

O Terraform cria a permissão de leitura para a VM. Os **valores** entram só por aqui, nunca em arquivo versionado.
O `read -s` evita que o valor fique no histórico do shell.

```bash
add_secret() { read -rsp "$1: " v; echo; printf '%s' "$v" | gcloud secrets create "$1" --data-file=- --replication-policy=automatic; unset v; }
add_secret mongodb-url          # string do Atlas (passo 9)
add_secret api-token            # token das rotas de gestão: openssl rand -hex 32
add_secret session-aes-key      # chave da sessão WhatsApp: openssl rand -base64 32
add_secret duckdns-token
# Depois, na E5: add_secret groq-api-key ; add_secret gemini-api-key
```

Para trocar um valor depois: `printf '%s' "$NOVO" | gcloud secrets versions add <nome> --data-file=-`.
O Always Free cobre 6 versões ativas; desative as versões antigas (`gcloud secrets versions disable`).

## 8. Domínio (DuckDNS)

1. Entre em https://www.duckdns.org com sua conta e crie um subdomínio (ex.: `<nome>.duckdns.org`).
2. Guarde o token no Secret Manager (passo 7). O IP é apontado depois do `apply`, quando a VM existir.

## 9. MongoDB Atlas

1. No cluster gratuito existente, crie o banco `whatsapp_api` (ele aparece na primeira escrita).
2. **Database Access → Add user** `whatsapp-api` com papel *readWrite* **só** no banco `whatsapp_api`.
3. **Network Access**: adicione o IP estático da VM depois do `apply` (output `ip_externo`). Não use `0.0.0.0/0`.
4. Salve a string de conexão em `mongodb-url` (passo 7).
5. Antes da migração para o Baileys 7 (E3), ative o backup do cluster e faça um `mongodump` manual.

## 10. GitHub: gitflow, environment e variáveis

```bash
# Branch develop
git switch master && git switch -c develop && git push -u origin develop

# Environment prod com você como revisor obrigatório
gh api -X PUT "repos/$REPO/environments/prod" \
  -F "reviewers[][type]=User" -F "reviewers[][id]=$(gh api user --jq .id)" \
  -F "deployment_branch_policy[protected_branches]=false" \
  -F "deployment_branch_policy[custom_branch_policies]=true"
gh api -X POST "repos/$REPO/environments/prod/deployment-branch-policies" -f name=master

# Variáveis (não são segredos: com WIF não há chave a guardar)
gh variable set GCP_PROJECT      --body "$PROJECT"
gh variable set GCP_ZONE         --body "$ZONE"
gh variable set GCP_WIF_PROVIDER --body "<saída do último comando do passo 6>"
gh variable set GCP_SA_PLAN      --body "$(SA gh-plan)"
gh variable set GCP_SA_TERRAFORM --body "$(SA gh-terraform)"
gh variable set GCP_SA_DEPLOY    --body "$(SA gh-deploy)"
gh variable set TF_STATE_BUCKET  --body "$PROJECT-tfstate"
```

Proteção das branches (em **Settings → Rules → Rulesets**, pelo navegador):

| Branch | Regras |
|---|---|
| `master` | PR obrigatório; checks `ci` verdes; sem push direto; sem force push; a origem deve ser `release/*` ou `hotfix/*` (checado pelo job `gitflow` do CI) |
| `develop` | PR obrigatório; checks `ci` verdes; sem force push |

O GitHub não deixa o autor aprovar o próprio PR. Num projeto com uma pessoa só, a aprovação é a do
**environment `prod`**: depois do merge, o deploy espera você clicar em *Approve* na aba Actions.

Se o repositório for privado no plano Free, revisores obrigatórios em environments não ficam disponíveis.
Nesse caso: deixe o repositório público ou troque a aprovação por um `workflow_dispatch` manual.

A imagem no GHCR precisa ser pública, ou a VM precisa de um token `read:packages`. Repositório público → pacote público.

## 11. Primeiro apply (manual, uma vez)

```bash
gcloud auth application-default login
cd infra/envs/prod
cp prod.tfvars.example prod.tfvars     # preencha; prod.tfvars está no .gitignore
terraform init -backend-config="bucket=$PROJECT-tfstate"
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
terraform output                       # ip_externo → DuckDNS e Atlas
```

A partir daqui, toda mudança passa pelo pipeline.

## 12. Verificação final

- [ ] `gcloud compute instances list` mostra **uma** `e2-micro` em `us-east1`
- [ ] Disco `pd-standard` de até 30 GB (`gcloud compute disks list`)
- [ ] `gcloud compute ssh <vm> --tunnel-through-iap` funciona e SSH sem IAP é recusado
- [ ] `curl https://<nome>.duckdns.org/status` → `OK`
- [ ] Depois de 48 h, **Faturamento → Relatórios** mostra R$ 0,00 (inclusive IP externo)
