---
paths:
  - "src/**"
  - "infra/**"
  - "docker-compose*.yml"
  - "Dockerfile"
  - ".github/**"
---
# Segurança (checklist)

- [ ] Nenhum segredo, token, URL com credencial ou chave em código, teste, doc ou imagem
- [ ] Chave da instância no cabeçalho, nunca na query string; comparação em tempo constante
- [ ] Rotas de gestão protegidas por padrão (não depender de `PROTECT_ROUTES=true`)
- [ ] Chat público: CORS restrito, rate limit por IP e por conversa, teto diário, msg ≤ 1.500 chars
- [ ] Nada de telefone, e-mail, documento ou conteúdo de mensagem em log ou atributo de métrica
- [ ] Dados pessoais mascarados antes de ir a qualquer LLM
- [ ] Falha de webhook/envio é logada e contada, nunca engolida em silêncio
- [ ] Credenciais da sessão WhatsApp cifradas (AES-GCM) antes de persistir
- [ ] Upload: limite de tamanho e tipo; sem `express.json({limit:'50mb'})` global
- [ ] Container sem root, imagem fixada por digest, `npm ci` com lockfile
- [ ] Só 80/443 públicos; Redis, RabbitMQ, Collector e painel apenas em rede interna
