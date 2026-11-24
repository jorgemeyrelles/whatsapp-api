# Mapa do código atual (legado, antes da migração)

Leia isto em vez de abrir os arquivos inteiros. Atualize quando o legado mudar.

## Entrada
- `src/server.js` — sobe Express, conecta Mongo, restaura sessões (`RESTORE_SESSIONS_ON_START_UP`).
- `src/config/express.js` — `global.WhatsAppInstances = {}`, `tokenCheck` só se `PROTECT_ROUTES`.
- `src/config/config.js` — lê `.env` (token, porta, mongo, webhook, browser, retry de QR).

## Rotas (`src/api/routes/`) → controllers (`src/api/controllers/`)
| Prefixo | Rotas | Middlewares |
|---|---|---|
| `/instance` | init, qr, qrbase64, phone-number-code, info, restore, logout, delete, list | keyVerify (`?key=` na query) |
| `/message` | text, image, video, audio, doc, mediaurl, button, contact, list, setstatus, mediabutton, read, react | keyVerify + loginVerify (+ multer) |
| `/group` | create, listall, leave, inviteuser, makeadmin, demoteadmin, getinvitecode, getallgroups, participantsupdate, settingsupdate, updatesubject, updatedescription, inviteinfo, groupjoin | keyVerify + loginVerify |
| `/misc` | onwhatsapp, downProfile, getStatus, blockUser, updateProfilePicture, getuserorgroupbyid | keyVerify + loginVerify |
| `/audit` | find | — |
| `/status` | OK | — |
| `/instance/connect-link` (POST) | gera link de uso único para conectar o número | bearer (gestão) |
| `/conectar/:token` (GET, sem efeito), `/:token/abrir` (POST, reivindica), `/:token/estado` | página pública do QR + polling (3 s) | **antes** do tokenCheck; protegido pelo link (`helper/connectLinkStore.js`, em memória, 5 min para abrir, 10 min de sessão, cookie HttpOnly) |

## `src/api/class/instance.js` (1.097 linhas — use `grep -n`)
- L76 `init()` cria o socket; L93 `connection.update` (reconexão imediata, sem backoff).
- L230 `messages.upsert`: **resposta automática com menu fixo** (L280–305, sufixo `**resposta teste**`),
  só trata `conversation`; destinatário via `split('@')` → quebra com LID.
- L65 `SendWebhook` — erros ignorados. `instance.messages` cresce sem limite.
- L501+ métodos de envio; L678+ grupos; L1059+ registro mobile.
- Outras classes: `session.js` (restauração: trata **cada coleção** como instância — inclusive a de auditoria),
  `audit.js` (AuditMessages, estado estático compartilhado).

## Persistência
- `helper/mongoAuthState.js` — uma coleção por instância; `helper/connectMongoClient.js` (driver) +
  `models/chat.model.js` (Mongoose) — dois clientes.

## Testes e CI
- `tests/status.route.test.js` (mocha + supertest) — único teste.
- CI antigo removido (fase 02 de ambientes-deploy); restam `codeql-analysis.yml`, `stale.yml`, `dependabot.yml`.
- Docker: `Dockerfile` (alvos dev/runtime, Node 24) + Compose base/override/prod; ver `.claude/guias/deploy-infra.md`.
- Baileys fixado em 6.6.0 (sem `^`).
