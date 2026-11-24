#!/usr/bin/env bash
# SessionStart: injeta no contexto só o estado das tarefas ativas (poucas linhas).
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
echo "Branch: $(git branch --show-current 2>/dev/null)"
found=0
for p in .claude/plans/*/00-plano.md; do
  case "$p" in *"_templates"*) continue ;; esac
  [ -f "$p" ] || continue
  next=$(grep -m1 -E '^- \[ \] [0-9]{2}' "$p" | sed 's/^- \[ \] //')
  [ -n "$next" ] && { echo "Tarefa ativa: $(basename "$(dirname "$p")") → fase em aberto: $next"; found=1; }
done
[ $found -eq 0 ] && echo "Sem tarefa ativa. Próxima etapa do roadmap: $(grep -m1 -E '^- \[ \] E[0-9]' .claude/plans/00-roadmap.md | sed 's/^- \[ \] //')"
exit 0
