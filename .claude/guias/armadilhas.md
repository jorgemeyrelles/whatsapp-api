# Armadilhas (não repetir)

Cresce só quando um erro real acontece. Formato: sintoma → causa → como evitar.

- Resposta indo para endereço inválido → destinatário remontado por `split('@')` → usar o JID/LID recebido.
- Instância fantasma na restauração → `session.js` trata toda coleção como instância (inclui auditoria) → coleção única com campo `instancia`.
- Memória crescendo até reiniciar → `instance.messages` sem limite → não guardar em memória; TTL no Redis.
- Laço de reconexão → `connection.update` reconecta na hora → backoff exponencial + teto.
- Mensagens perdidas sem rastro → falha de webhook engolida → log + métrica + retry limitado.
- CI verde que não roda → workflow escuta `main`, repo usa `master`.
- `package.json` e README ainda do projeto de origem (MIT, aviso de arquivamento) → manter crédito e licença, trocar nome/descrição.
- Logo de cliente (`views/assets/fundacaoabc-*.png`) em repo público → confirmar autorização ou trocar.
- Plano gratuito de LLM muda sem aviso → limites em config + alerta em todo 429.
- Registro mobile quebra em silêncio → `^6.6.0` resolve Baileys 6.17, sem `PHONENUMBER_MCC` → versão exata no package.json + yarn.lock versionado.
- `docker compose up` falha com "address already in use" na 27017 → Mongo local no host → o Compose publica na 27018 (`MONGO_HOST_PORT`).
- Healthcheck/uptime em `/status` retorna 403 → `PROTECT_ROUTES=true` protege até o status → healthcheck envia o bearer do próprio container.

- **Link de uso único nunca é gasto em GET.** Prefetch do navegador, preview do WhatsApp e F5 fazem GET/HEAD; se o GET reivindicar, o usuário recebe "expirado". Reivindicação só no `POST /conectar/:token/abrir` (clique no botão).
