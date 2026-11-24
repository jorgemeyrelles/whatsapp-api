#!/usr/bin/env bash
# PostToolUse (Write|Edit): formata e linta só o arquivo editado. Silencioso quando está tudo certo.
set -u
FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -d node_modules ] || exit 0
case "$FILE" in
  *.js|*.mjs|*.cjs|*.ts|*.tsx)
    npx --no-install prettier --write "$FILE" >/dev/null 2>&1
    OUT=$(npx --no-install eslint --quiet "$FILE" 2>&1)
    if [ $? -ne 0 ]; then echo "eslint em $FILE:" >&2; echo "$OUT" | tail -n 15 >&2; exit 2; fi
    ;;
  *.json|*.md|*.yml|*.yaml)
    npx --no-install prettier --write "$FILE" >/dev/null 2>&1 ;;
esac
exit 0
