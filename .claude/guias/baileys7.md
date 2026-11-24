# Baileys 7 — o que muda

- **ESM only** → o projeto precisa ser ESM (TS com `"module": "NodeNext"`).
- **LID**: conversas endereçadas por identificador próprio; rede converte número→LID, nunca o contrário.
  Guarde e use o JID recebido; não reconstrua pelo telefone.
- **Auth state**: o armazenamento precisa guardar três novos tipos de chave. Usar coleção única
  `sessoes` com `{instancia, tipo, id}` (o Atlas free tem teto de 500 coleções).
- **Sem ACK de entrega** (contas eram bloqueadas por enviá-los). Não reimplementar.
- Versão ainda RC (7.0.0-rc14 em 16/11/2026): **fixar versão exata**, atualizar de propósito.
- Migração da sessão **não tem volta**: `mongodump` antes da primeira subida.
- Conferir o guia oficial de migração para a v7 (repositório WhiskeySockets/Baileys) antes de codar.
