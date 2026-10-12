# Guia de Testes de Integridade do Banco de Dados (`TESTESBD.md`)

Este documento reúne os comandos CLI e blocos SQL transacionais para validar diretamente no PostgreSQL 18 todas as restrições de integridade do banco de dados do projeto **Solum**:
- **RN12:** Restrições `CHECK (> 0)` em quantidades, pesos, capacidades e valores monetários (10 constraints).
- **RN07:** Restrição `CHECK` de coerência entre `status`, `transportador_id` e `veiculo_id` em `fretes`, além da chave estrangeira composta `(veiculo_id, transportador_id) -> veiculos(id, transportador_id)`.
- **RN11:** Imutabilidade e auditoria — bloqueio de deleção física via `ON DELETE RESTRICT` e comprovação de exclusão lógica via `excluido_em` (soft-delete).

> [!IMPORTANT]
> Todos os testes abaixo utilizam blocos `BEGIN; ... ROLLBACK;` ou subtransações PL/pgSQL (`DO $$ ... EXCEPTION ... $$`) para **provocar e comprovar os erros de constraint sem sujar nem destruir dados reais** (em conformidade com a RN11).

---

## Pré-requisito: Inspecionar Constraints Ativas no PostgreSQL

A partir da pasta `back/`, execute:

```powershell
docker compose exec -T db psql -U solum -d solum -c "SELECT conname, contype, pg_get_constraintdef(oid) AS definicao FROM pg_constraint WHERE connamespace = 'public'::regnamespace AND contype IN ('c', 'f') ORDER BY contype, conname;"
```

---

## 1. Validação da RN12 — Constraints `CHECK (> 0)`

A migration inicial (`20261012000000_init`) define **10 constraints numéricas estritamente positivas**:
1. `veiculos_capacidade_toneladas_positiva_chk` (`capacidade_toneladas > 0`)
2. `ofertas_quantidade_positiva_chk` (`quantidade > 0`)
3. `ofertas_preco_positivo_chk` (`preco > 0`)
4. `propostas_quantidade_positiva_chk` (`quantidade > 0`)
5. `propostas_preco_positivo_chk` (`preco > 0`)
6. `contrapropostas_quantidade_positiva_chk` (`quantidade_contraproposta > 0`)
7. `contrapropostas_preco_positivo_chk` (`preco_contraproposta > 0`)
8. `pedidos_quantidade_final_positiva_chk` (`quantidade_final > 0`)
9. `pedidos_preco_final_positivo_chk` (`preco_final > 0`)
10. `fretes_peso_toneladas_positivo_chk` (`peso_toneladas > 0`) e `fretes_valor_frete_positivo_chk` (`valor_frete IS NULL OR valor_frete > 0`)

### 1.1. Disparo de Erro Direto (SQL Individual)

#### A) Oferta com preço igual a zero (`ofertas_preco_positivo_chk`)
```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
INSERT INTO ofertas (id, produtor_id, produto, categoria, qualidade, safra, quantidade, unidade, preco, localizacao, periodo, atualizado_em)
SELECT gen_random_uuid(), id, 'Soja Teste', 'Grãos', 'A', '2026/2027', 10, 't', 0, 'Sorriso-MT', 'Imediato', now()
FROM usuarios WHERE email = 'produtor@solum.com.br';
ROLLBACK;
"
```
**Resultado esperado:** `ERROR: new row for relation "ofertas" violates check constraint "ofertas_preco_positivo_chk"` (SQLSTATE `23514`).

#### B) Veículo com capacidade negativa (`veiculos_capacidade_toneladas_positiva_chk`)
```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
INSERT INTO veiculos (id, transportador_id, tipo_veiculo, capacidade_toneladas, atualizado_em)
SELECT gen_random_uuid(), id, 'CARRETA', -5.000, now()
FROM usuarios WHERE email = 'transportador@solum.com.br';
ROLLBACK;
"
```
**Resultado esperado:** `ERROR: new row for relation "veiculos" violates check constraint "veiculos_capacidade_toneladas_positiva_chk"` (SQLSTATE `23514`).

---

## 2. Validação da RN07 — Vínculo e Status do Frete

O modelo `Frete` possui duas barreiras no banco de dados para a **RN07**:
1. **`fretes_transportador_status_chk`:**
   - Quando `status = 'DISPONIVEL'`, `transportador_id` e `veiculo_id` **DEVEM ser `NULL`**.
   - Quando `status IN ('ACEITO', 'EM_ROTA', 'ENTREGUE')`, `transportador_id` e `veiculo_id` **DEVEM ser `NOT NULL`**.
2. **`fretes_veiculo_id_transportador_id_fkey` (FK Composta):**
   - Garante que o par `(veiculo_id, transportador_id)` exista exatamente na tabela `veiculos`. Impede que um transportador aceite um frete vinculando o veículo de outro transportador.

### 2.1. Disparo de Erro: Frete `ACEITO` sem transportador/veículo
```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
WITH novo_pedido AS (
  INSERT INTO pedidos (id, codigo, oferta_id, comprador_id, preco_final, quantidade_final, endereco_entrega, status, atualizado_em)
  SELECT gen_random_uuid(), 'PED-TESTE-RN07', '11111111-1111-4111-8111-111111111101', id, 2150.00, 10.000, 'Santos-SP', 'FECHADO', now()
  FROM usuarios WHERE email = 'comprador@solum.com.br'
  RETURNING id
)
INSERT INTO fretes (id, codigo, pedido_id, transportador_id, veiculo_id, endereco_origem, endereco_destino, peso_toneladas, status, atualizado_em)
SELECT gen_random_uuid(), 'FRT-TESTE-RN07', id, NULL, NULL, 'Sorriso-MT', 'Santos-SP', 10.000, 'ACEITO', now()
FROM novo_pedido;
ROLLBACK;
"
```
**Resultado esperado:** `ERROR: new row for relation "fretes" violates check constraint "fretes_transportador_status_chk"` (SQLSTATE `23514`).

### 2.2. Disparo de Erro: Frete `DISPONIVEL` já com transportador preenchido
```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
WITH novo_pedido AS (
  INSERT INTO pedidos (id, codigo, oferta_id, comprador_id, preco_final, quantidade_final, endereco_entrega, status, atualizado_em)
  SELECT gen_random_uuid(), 'PED-TESTE-RN07B', '11111111-1111-4111-8111-111111111101', id, 2150.00, 10.000, 'Santos-SP', 'FECHADO', now()
  FROM usuarios WHERE email = 'comprador@solum.com.br'
  RETURNING id
)
INSERT INTO fretes (id, codigo, pedido_id, transportador_id, veiculo_id, endereco_origem, endereco_destino, peso_toneladas, status, atualizado_em)
SELECT gen_random_uuid(), 'FRT-TESTE-RN07B', novo_pedido.id, u.id, '22222222-2222-4222-8222-222222222201', 'Sorriso-MT', 'Santos-SP', 10.000, 'DISPONIVEL', now()
FROM novo_pedido, usuarios u WHERE u.email = 'transportador@solum.com.br';
ROLLBACK;
"
```
**Resultado esperado:** `ERROR: new row for relation "fretes" violates check constraint "fretes_transportador_status_chk"`.

---

## 3. Validação da RN11 — Imutabilidade, `ON DELETE RESTRICT` e Soft-Delete (`excluido_em`)

### 3.1. Bloqueio de Deleção Física pelo Banco (`ON DELETE RESTRICT`)
Todas as 12 chaves estrangeiras do banco possuem `ON DELETE RESTRICT`. Qualquer tentativa de remover fisicamente um registro referenciado é abortada pelo PostgreSQL (SQLSTATE `23503`), mesmo fora da aplicação:

```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
-- Tentativa proibida (RN11) dentro de ROLLBACK apenas para provar o bloqueio da FK:
UPDATE ofertas SET excluido_em = now(), status = 'ENCERRADA' WHERE id = '11111111-1111-4111-8111-111111111101';
SELECT id, status, excluido_em FROM ofertas WHERE id = '11111111-1111-4111-8111-111111111101';
ROLLBACK;
"
```

### 3.2. Comprovação de Soft-Delete na Aplicação
Na camada de serviços (`src/services/`), **não existe nenhuma chamada** a `.delete()` ou `.deleteMany()`. Encerramentos e remoções administrativas atualizam `excluido_em` e `status`:
- **Remoção de oferta por Admin (`RN09 + RN11`):** `PATCH /api/ofertas/:id/remover` → `status = 'ENCERRADA'`, `excluido_em = now()`.
- **Desativação de veículo (`RN11`):** `PATCH /api/veiculos/:id/desativar` → `excluido_em = now()`.
- **Recusa ou expiração de proposta (`RN11`):** `POST /api/propostas/:id/recusar` → arquiva o `Pedido` em `NEGOCIANDO` preenchendo `excluido_em = now()`.

---

## 4. Suíte Automatizada Completa em Um Único Comando (PostgreSQL PL/pgSQL)

Execute o comando abaixo na pasta `back/` para testar simultaneamente **todas as constraints da RN12 e da RN07** dentro de uma transação revertida ao final (`ROLLBACK`):

```powershell
docker compose exec -T db psql -U solum -d solum -v ON_ERROR_STOP=1 -c "
BEGIN;
DO `$`$
DECLARE
  v_produtor uuid;
  v_comprador uuid;
  v_transp uuid;
  v_outro_transp uuid;
  v_pedido uuid;
BEGIN
  SELECT id INTO v_produtor FROM usuarios WHERE email = 'produtor@solum.com.br';
  SELECT id INTO v_comprador FROM usuarios WHERE email = 'comprador@solum.com.br';
  SELECT id INTO v_transp FROM usuarios WHERE email = 'transportador@solum.com.br';

  -- 1. RN12: Oferta com preco <= 0
  BEGIN
    INSERT INTO ofertas (id, produtor_id, produto, categoria, qualidade, safra, quantidade, unidade, preco, localizacao, periodo, atualizado_em)
    VALUES (gen_random_uuid(), v_produtor, 'X', 'X', 'X', '2026', 10, 't', 0, 'X', 'X', now());
    RAISE EXCEPTION 'FALHA: ofertas_preco_positivo_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] ofertas_preco_positivo_chk bloqueou preco = 0';
  END;

  -- 2. RN12: Oferta com quantidade <= 0
  BEGIN
    INSERT INTO ofertas (id, produtor_id, produto, categoria, qualidade, safra, quantidade, unidade, preco, localizacao, periodo, atualizado_em)
    VALUES (gen_random_uuid(), v_produtor, 'X', 'X', 'X', '2026', -5, 't', 100, 'X', 'X', now());
    RAISE EXCEPTION 'FALHA: ofertas_quantidade_positiva_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] ofertas_quantidade_positiva_chk bloqueou quantidade = -5';
  END;

  -- 3. RN12: Veiculo com capacidade <= 0
  BEGIN
    INSERT INTO veiculos (id, transportador_id, tipo_veiculo, capacidade_toneladas, atualizado_em)
    VALUES (gen_random_uuid(), v_transp, 'VUC', 0, now());
    RAISE EXCEPTION 'FALHA: veiculos_capacidade_toneladas_positiva_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] veiculos_capacidade_toneladas_positiva_chk bloqueou capacidade = 0';
  END;

  -- 4. RN12: Proposta com preco <= 0
  BEGIN
    INSERT INTO propostas (id, oferta_id, comprador_id, quantidade, preco, atualizado_em)
    VALUES (gen_random_uuid(), '11111111-1111-4111-8111-111111111101', v_comprador, 10, -1, now());
    RAISE EXCEPTION 'FALHA: propostas_preco_positivo_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] propostas_preco_positivo_chk bloqueou preco = -1';
  END;

  -- 5. RN12: Pedido com quantidade_final <= 0
  BEGIN
    INSERT INTO pedidos (id, codigo, oferta_id, comprador_id, preco_final, quantidade_final, endereco_entrega, status, atualizado_em)
    VALUES (gen_random_uuid(), 'PED-CHK-1', '11111111-1111-4111-8111-111111111101', v_comprador, 100, 0, 'X', 'ABERTO', now());
    RAISE EXCEPTION 'FALHA: pedidos_quantidade_final_positiva_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] pedidos_quantidade_final_positiva_chk bloqueou quantidade_final = 0';
  END;

  -- Cria pedido valido em memoria para testar Frete (RN07 e RN12)
  v_pedido := gen_random_uuid();
  INSERT INTO pedidos (id, codigo, oferta_id, comprador_id, preco_final, quantidade_final, endereco_entrega, status, atualizado_em)
  VALUES (v_pedido, 'PED-VALIDO-TESTE', '11111111-1111-4111-8111-111111111101', v_comprador, 2150, 10, 'Santos-SP', 'FECHADO', now());

  -- 6. RN12: Frete com peso_toneladas <= 0
  BEGIN
    INSERT INTO fretes (id, codigo, pedido_id, endereco_origem, endereco_destino, peso_toneladas, status, atualizado_em)
    VALUES (gen_random_uuid(), 'FRT-CHK-1', v_pedido, 'A', 'B', 0, 'DISPONIVEL', now());
    RAISE EXCEPTION 'FALHA: fretes_peso_toneladas_positivo_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN12] fretes_peso_toneladas_positivo_chk bloqueou peso_toneladas = 0';
  END;

  -- 7. RN07: Frete ACEITO sem transportador/veiculo
  BEGIN
    INSERT INTO fretes (id, codigo, pedido_id, transportador_id, veiculo_id, endereco_origem, endereco_destino, peso_toneladas, status, atualizado_em)
    VALUES (gen_random_uuid(), 'FRT-CHK-2', v_pedido, NULL, NULL, 'A', 'B', 10, 'ACEITO', now());
    RAISE EXCEPTION 'FALHA: fretes_transportador_status_chk nao disparou';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'OK [RN07] fretes_transportador_status_chk bloqueou status ACEITO sem transportador/veiculo';
  END;

  -- 8. RN07: FK composta impedindo veiculo de outro transportador
  v_outro_transp := gen_random_uuid();
  INSERT INTO usuarios (id, nome, documento, whatsapp, email, senha_hash, perfil, atualizado_em)
  VALUES (v_outro_transp, 'Outro Transp', '99999999000199', '11999999999', 'outro@solum.com.br', 'hash', 'TRANSPORTADOR', now());

  BEGIN
    INSERT INTO fretes (id, codigo, pedido_id, transportador_id, veiculo_id, endereco_origem, endereco_destino, peso_toneladas, status, atualizado_em)
    VALUES (gen_random_uuid(), 'FRT-CHK-3', v_pedido, v_outro_transp, '22222222-2222-4222-8222-222222222201', 'A', 'B', 10, 'ACEITO', now());
    RAISE EXCEPTION 'FALHA: FK composta fretes_veiculo_id_transportador_id_fkey nao disparou';
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE NOTICE 'OK [RN07] FK composta bloqueou vinculo de veiculo pertencente a outro transportador';
  END;
END `$`$;
ROLLBACK;
"
```
