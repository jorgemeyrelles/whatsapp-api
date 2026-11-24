---
paths:
  - "src/**"
  - "tests/**"
---
# Código (checklist)

- [ ] TypeScript `strict`, ESM; sem `any` implícito, sem `// @ts-ignore` sem justificativa
- [ ] Sem `console.*` — usar o logger (pino) com nível adequado
- [ ] Sem variável/parâmetro/import não usado; literal repetido vira constante
- [ ] `async` sempre com `await` ou retorno de Promise tratado (sem promessa solta)
- [ ] `catch` não vazio: loga com contexto ou relança tipado
- [ ] Funções ≤ 40 linhas e complexidade baixa; early return em vez de `if` aninhado
- [ ] Nomes de domínio em português, termos técnicos em inglês (como já está no projeto)
- [ ] `yarn lint:check` e `yarn format:check` limpos
