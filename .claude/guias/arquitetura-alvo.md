# Arquitetura alvo

Fonte: doc "WhatsApp API: plano de melhoria e atendente virtual com LLM" (Claude Docs, rev 51).

## Seis módulos NestJS (`src/modules/<nome>/`)
1. **canal** — interface `Channel` (`sendText`, eventos de entrada). Impl: `BaileysChannel` (custo zero);
   futura `MetaCloudChannel`. Normaliza tudo para `InboundMessage` com `conversationId` opaco.
2. **entrada** — publica em `mensagens.recebidas` (BullMQ sobre Redis — ADR 0001; RabbitMQ só se sair do 1 GB); consumidor deduplica por `messageId`
   (Redis) e processa cada conversa em ordem.
3. **atendimento** — o harness (TS puro, sem Nest dentro): regras fixas → guarda → roteador de
   assunto → prompt → modelo → `judge` → estado → resumo. Não importa `canal`.
4. **modelos** — interface `LlmProvider`; `OpenAiCompatible` serve Groq (`openai/gpt-oss-20b`,
   principal) e Gemini 3.1 Flash-Lite (reserva). Troca por variável de ambiente.
5. **conhecimento** — `conhecimento/*.md` versionados (perfil, projetos, forma-de-trabalhar,
   soft-skills, servicos, faq), cada trecho com id citável.
6. **gestao** — rotas atuais (instância, QR, envio, webhook) com proteção ligada e chave no cabeçalho.
   + **admin** (opcional): números prontos para o painel Next.js estático.

## Fluxo do chat
Widget React (GitHub Pages) → `POST /chat` (202) → fila → worker/harness → Redis pub → `GET /chat/:id/stream` (SSE).
Resumo qualificado sai pelo WhatsApp para o número do dono, só com consentimento.

## Contratos (Zod)
`InboundMessage` (entrada) · `ModelReply {intent, answer≤700, sources≤3, service, confidence, lead}` ·
`OutboundMessage {conversationId, text, origin: regra|modelo|recusa|seguro}`.

## Ordem de migração (roadmap)
Decisões → rede de segurança (testes + ~30 conversas gravadas) → base nova (Node 24/TS/Nest/Compose/CI)
→ canal (Baileys 7) → fila (BullMQ) e estado → agente simples (baseline) → harness → deploy → piloto.
