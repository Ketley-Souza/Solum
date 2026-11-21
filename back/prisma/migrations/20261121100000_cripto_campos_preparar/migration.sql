-- Criptografia em repouso (etapa 1/2): prepara colunas para guardar texto cifrado.
-- Os valores existentes são cifrados por `npm run cifrar-dados`; depois aplica-se a etapa 2.
ALTER TABLE "usuarios" ALTER COLUMN "documento" TYPE TEXT;
ALTER TABLE "usuarios" ALTER COLUMN "whatsapp" TYPE TEXT;
ALTER TABLE "usuarios" ADD COLUMN "documento_hash" VARCHAR(64);
DROP INDEX "usuarios_documento_key";

ALTER TABLE "pedidos" ALTER COLUMN "endereco_entrega" TYPE TEXT;

ALTER TABLE "fretes" ALTER COLUMN "endereco_origem" TYPE TEXT;
ALTER TABLE "fretes" ALTER COLUMN "endereco_destino" TYPE TEXT;
