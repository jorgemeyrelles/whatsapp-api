# Harness da assistente — como e por quê

O modelo escreve; o código decide. A garantia não é o prompt, é a checagem depois da resposta.

## Dez passos de `handle(msg, deps)`
1 dedup (Redis) · 2 regra fixa (saudação, "sair", aviso inicial) · 3 guarda de injeção (strike) ·
4 seleciona só os trechos do assunto · 5 prompt com janela curta (6 trocas) e mensagem delimitada ·
6 modelo com `withFallback` · 7 `judge` · 8 escalar ao reserva uma vez · 9 atualiza estado/lead ·
10 `closeLead` envia resumo se `consent`.

## Por que economiza
Premissas (8 msgs/conversa): agente simples ≈ 31,5k tokens; harness ≈ 8,1k → 6 vs 24 conversas/dia
na cota Groq de 200k tokens/dia. São **estimativas** — o piloto substitui por medição.

## Produto
- Cinco gatilhos de venda permitidos: prova específica, diagnóstico útil, encaixe de serviço, risco
  menor, próximo passo único. Proibido: urgência/escassez inventadas.
- Três serviços: Desenvolvimento do Zero, Apoio em Projetos, Consultoria em IA.
- Duas recusas seguidas → encerra com educação. Contato só pedido e enviado com "sim".
- Gemini free usa dados para treino → mascarar PII é obrigatório.

Esboços de código (contracts.ts, guard.ts, providers.ts, handle.ts, summary.ts) estão no doc do plano;
copie de lá ao implementar e ajuste — não foram testados no repositório.
