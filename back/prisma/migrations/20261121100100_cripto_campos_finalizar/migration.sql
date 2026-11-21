-- Criptografia em repouso (etapa 2/2): exige `npm run cifrar-dados` executado antes.
-- Se houver usuários sem índice cego, a migration aborta (e reverte) em vez de gravar dados inconsistentes.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "usuarios" WHERE "documento_hash" IS NULL) THEN
    RAISE EXCEPTION 'Execute `npm run cifrar-dados` antes desta migration (usuarios sem documento_hash).';
  END IF;
END $$;

ALTER TABLE "usuarios" ALTER COLUMN "documento_hash" SET NOT NULL;
CREATE UNIQUE INDEX "usuarios_documento_hash_key" ON "usuarios"("documento_hash");
