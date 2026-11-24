---
paths:
  - "tests/**"
  - "**/*.spec.ts"
  - "**/*.test.*"
---
# Testes (checklist)

- [ ] Toda mudança de comportamento tem teste que falha antes e passa depois
- [ ] Adaptadores (canal, LLM, fila) testados com dublê — sem rede real no CI
- [ ] Harness testado contra as conversas gravadas em `tests/conversas/` (regressão)
- [ ] Teste não depende de ordem nem de relógio real (usar fake timers)
- [ ] Nenhum dado pessoal real em fixture
- [ ] `yarn test` verde antes de `/fechar-fase`
