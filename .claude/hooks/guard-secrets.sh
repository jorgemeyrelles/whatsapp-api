#!/usr/bin/env bash
# PreToolUse (Write|Edit): bloqueia escrita de segredo óbvio em arquivo versionado.
set -u
IN=$(cat)
FILE=$(echo "$IN" | jq -r '.tool_input.file_path // empty')
case "$FILE" in *.env|*/.env|*.env.local) echo "Bloqueado: não escreva em .env" >&2; exit 2 ;; esac
TEXT=$(echo "$IN" | jq -r '(.tool_input.content // "") + (.tool_input.new_string // "")')
if echo "$TEXT" | grep -qE '(mongodb(\+srv)?://[^:/ ]+:[^@ ]+@|gsk_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|re_[A-Za-z0-9]{20,})'; then
  echo "Bloqueado: possível segredo em $FILE. Use variável de ambiente." >&2; exit 2
fi
exit 0
