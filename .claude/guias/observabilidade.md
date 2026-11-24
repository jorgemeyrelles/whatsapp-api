# Observabilidade

- OpenTelemetry inicializa **antes** do NestJS; Collector na VM.
- Caminho A (padrão): Grafana Cloud free (10k séries, 14 dias) — conta compartilhada com Rede Studio.
  Caminho B: Prometheus local + painel Next.js estático via túnel do Bastion. Trocar = mudar exporters no Collector.
- Métricas de produto (harness): conversas/dia, % por regra, tokens/conversa, p50/p máx por modelo,
  uso do reserva, respostas seguras, recusas, resumos enviados.
- Métricas de sistema: req/erros, profundidade da fila, latência Redis/Atlas, sessão WhatsApp, 429 por provedor, CPU/mem.
- **Nunca** `conversationId`, telefone ou texto como label (explode séries e vaza PII).
- Alertas: sessão desconectada, fila parada >5 min, 429 seguidos, VM sem telemetria 10 min, uso ~20% por dias.
