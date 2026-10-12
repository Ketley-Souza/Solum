-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "perfil_usuario" AS ENUM ('PRODUTOR', 'COMPRADOR', 'TRANSPORTADOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "status_usuario" AS ENUM ('ATIVO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "tipo_veiculo" AS ENUM ('VUC', 'TOCO', 'TRUCK', 'CARRETA', 'BITREM', 'RODOTREM');

-- CreateEnum
CREATE TYPE "status_oferta" AS ENUM ('ATIVA', 'PAUSADA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "status_proposta" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CONTRAPROPOSTA');

-- CreateEnum
CREATE TYPE "status_contra_proposta" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "status_pedido" AS ENUM ('ABERTO', 'NEGOCIANDO', 'FECHADO', 'EM_TRANSPORTE', 'ENTREGUE');

-- CreateEnum
CREATE TYPE "status_frete" AS ENUM ('DISPONIVEL', 'ACEITO', 'RECUSADO', 'EM_ROTA', 'ENTREGUE');

-- CreateEnum
CREATE TYPE "tipo_referencia" AS ENUM ('OFERTA', 'PROPOSTA', 'CONTRA_PROPOSTA', 'PEDIDO', 'FRETE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "documento" VARCHAR(14) NOT NULL,
    "whatsapp" VARCHAR(20) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "perfil" "perfil_usuario" NOT NULL,
    "status" "status_usuario" NOT NULL DEFAULT 'ATIVO',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" UUID NOT NULL,
    "transportador_id" UUID NOT NULL,
    "tipo_veiculo" "tipo_veiculo" NOT NULL,
    "capacidade_toneladas" DECIMAL(10,3) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofertas" (
    "id" UUID NOT NULL,
    "produtor_id" UUID NOT NULL,
    "produto" VARCHAR(120) NOT NULL,
    "categoria" VARCHAR(80) NOT NULL,
    "qualidade" VARCHAR(80) NOT NULL,
    "safra" VARCHAR(20) NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "unidade" VARCHAR(20) NOT NULL,
    "preco" DECIMAL(14,2) NOT NULL,
    "localizacao" VARCHAR(200) NOT NULL,
    "periodo" VARCHAR(80) NOT NULL,
    "descricao" TEXT,
    "imagem_url" TEXT,
    "status" "status_oferta" NOT NULL DEFAULT 'ATIVA',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "ofertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propostas" (
    "id" UUID NOT NULL,
    "oferta_id" UUID NOT NULL,
    "comprador_id" UUID NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "preco" DECIMAL(14,2) NOT NULL,
    "status" "status_proposta" NOT NULL DEFAULT 'PENDENTE',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrapropostas" (
    "id" UUID NOT NULL,
    "proposta_id" UUID NOT NULL,
    "preco_contraproposta" DECIMAL(14,2) NOT NULL,
    "quantidade_contraproposta" DECIMAL(14,3) NOT NULL,
    "mensagem" TEXT,
    "status" "status_contra_proposta" NOT NULL DEFAULT 'PENDENTE',
    "expira_em" TIMESTAMPTZ(3) NOT NULL DEFAULT (now() + '24:00:00'::interval),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "contrapropostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "oferta_id" UUID NOT NULL,
    "proposta_id" UUID,
    "comprador_id" UUID NOT NULL,
    "preco_final" DECIMAL(14,2) NOT NULL,
    "quantidade_final" DECIMAL(14,3) NOT NULL,
    "endereco_entrega" VARCHAR(300) NOT NULL,
    "status" "status_pedido" NOT NULL DEFAULT 'ABERTO',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fretes" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "pedido_id" UUID NOT NULL,
    "transportador_id" UUID,
    "veiculo_id" UUID,
    "endereco_origem" VARCHAR(300) NOT NULL,
    "endereco_destino" VARCHAR(300) NOT NULL,
    "peso_toneladas" DECIMAL(10,3) NOT NULL,
    "valor_frete" DECIMAL(14,2),
    "status" "status_frete" NOT NULL DEFAULT 'DISPONIVEL',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "fretes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "tipo_referencia" "tipo_referencia",
    "referencia_id" UUID,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,
    "excluido_em" TIMESTAMPTZ(3),

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_documento_key" ON "usuarios"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "veiculos_transportador_id_idx" ON "veiculos"("transportador_id");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_id_transportador_id_key" ON "veiculos"("id", "transportador_id");

-- CreateIndex
CREATE INDEX "ofertas_produtor_id_idx" ON "ofertas"("produtor_id");

-- CreateIndex
CREATE INDEX "ofertas_status_idx" ON "ofertas"("status");

-- CreateIndex
CREATE INDEX "propostas_oferta_id_idx" ON "propostas"("oferta_id");

-- CreateIndex
CREATE INDEX "propostas_comprador_id_idx" ON "propostas"("comprador_id");

-- CreateIndex
CREATE INDEX "propostas_status_idx" ON "propostas"("status");

-- CreateIndex
CREATE INDEX "contrapropostas_proposta_id_idx" ON "contrapropostas"("proposta_id");

-- CreateIndex
CREATE INDEX "contrapropostas_status_expira_em_idx" ON "contrapropostas"("status", "expira_em");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_codigo_key" ON "pedidos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_proposta_id_key" ON "pedidos"("proposta_id");

-- CreateIndex
CREATE INDEX "pedidos_oferta_id_idx" ON "pedidos"("oferta_id");

-- CreateIndex
CREATE INDEX "pedidos_comprador_id_idx" ON "pedidos"("comprador_id");

-- CreateIndex
CREATE INDEX "pedidos_status_idx" ON "pedidos"("status");

-- CreateIndex
CREATE UNIQUE INDEX "fretes_codigo_key" ON "fretes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "fretes_pedido_id_key" ON "fretes"("pedido_id");

-- CreateIndex
CREATE INDEX "fretes_transportador_id_idx" ON "fretes"("transportador_id");

-- CreateIndex
CREATE INDEX "fretes_veiculo_id_idx" ON "fretes"("veiculo_id");

-- CreateIndex
CREATE INDEX "fretes_status_idx" ON "fretes"("status");

-- CreateIndex
CREATE INDEX "notificacoes_usuario_id_lida_idx" ON "notificacoes"("usuario_id", "lida");

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_transportador_id_fkey" FOREIGN KEY ("transportador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_produtor_id_fkey" FOREIGN KEY ("produtor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "ofertas"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "contrapropostas" ADD CONSTRAINT "contrapropostas_proposta_id_fkey" FOREIGN KEY ("proposta_id") REFERENCES "propostas"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "ofertas"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_proposta_id_fkey" FOREIGN KEY ("proposta_id") REFERENCES "propostas"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_comprador_id_fkey" FOREIGN KEY ("comprador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_transportador_id_fkey" FOREIGN KEY ("transportador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_veiculo_id_transportador_id_fkey" FOREIGN KEY ("veiculo_id", "transportador_id") REFERENCES "veiculos"("id", "transportador_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- =============================================================
-- RN12 — Preços e quantidades estritamente maiores que zero
-- (CHECK constraints não são representáveis no schema.prisma)
-- =============================================================
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_capacidade_toneladas_positiva_chk" CHECK ("capacidade_toneladas" > 0);

ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_quantidade_positiva_chk" CHECK ("quantidade" > 0);
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_preco_positivo_chk" CHECK ("preco" > 0);

ALTER TABLE "propostas" ADD CONSTRAINT "propostas_quantidade_positiva_chk" CHECK ("quantidade" > 0);
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_preco_positivo_chk" CHECK ("preco" > 0);

ALTER TABLE "contrapropostas" ADD CONSTRAINT "contrapropostas_quantidade_positiva_chk" CHECK ("quantidade_contraproposta" > 0);
ALTER TABLE "contrapropostas" ADD CONSTRAINT "contrapropostas_preco_positivo_chk" CHECK ("preco_contraproposta" > 0);

ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_quantidade_final_positiva_chk" CHECK ("quantidade_final" > 0);
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_preco_final_positivo_chk" CHECK ("preco_final" > 0);

ALTER TABLE "fretes" ADD CONSTRAINT "fretes_peso_toneladas_positivo_chk" CHECK ("peso_toneladas" > 0);
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_valor_frete_positivo_chk" CHECK ("valor_frete" IS NULL OR "valor_frete" > 0);

-- RN07 — coerência transportador/veículo x status do frete
ALTER TABLE "fretes" ADD CONSTRAINT "fretes_transportador_status_chk" CHECK (
  ("status" = 'DISPONIVEL' AND "transportador_id" IS NULL AND "veiculo_id" IS NULL)
  OR ("status" IN ('ACEITO', 'EM_ROTA', 'ENTREGUE') AND "transportador_id" IS NOT NULL AND "veiculo_id" IS NOT NULL)
  OR ("status" = 'RECUSADO')
);
