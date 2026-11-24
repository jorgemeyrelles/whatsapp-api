---
name: corrigir-bug
description: Corrige um bug com reprodução primeiro. Use quando algo quebrou ou se comporta errado.
argument-hint: <sintoma observado>
---
Sintoma: $ARGUMENTS

1. Consulte `.claude/guias/armadilhas.md` — o bug pode já ser conhecido.
2. Formule a hipótese de causa e confirme lendo só o trecho suspeito (`grep -n`, `sed -n a,bp`).
3. Escreva um teste que reproduz o bug e **falha**. Sem reprodução, pare e peça dados ao usuário.
4. Corrija a causa (não o sintoma), rode o teste e a suíte.
5. Se a causa for uma armadilha reutilizável, acrescente 1 linha em `armadilhas.md` (sintoma → causa → como evitar).
6. Responda: causa, correção, teste — 3 linhas.
