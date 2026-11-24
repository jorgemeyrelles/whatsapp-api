---
name: analise-seguranca
description: Análise de segurança (segredos, auth, validação, PII/LGPD, prompt injection, dependências, Docker/CI) em contexto isolado. Use antes de deploy, ao tocar rotas públicas, sessão, LLM ou infra.
argument-hint: [diff | caminho | projeto] (padrão: diff)
context: fork
agent: auditor-seguranca
---
Alvo da auditoria: ${ARGUMENTS:-diff da branch atual contra master}.
Siga suas instruções de auditor e devolva a tabela de achados por severidade.
