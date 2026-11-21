# Guia de Configuração e Execução Local (`GUIA.md`)

Este guia descreve o passo a passo completo para qualquer integrante da equipe configurar, subir o banco de dados PostgreSQL 18, aplicar as migrations do Prisma 7, popular os dados iniciais (seed) e rodar a API REST do **Solum**.

---

## 1. Pré-requisitos

- **Node.js v24+** (projeto configurado em ES Modules `"type": "module"`).
- **Docker Desktop** ativo (para o container PostgreSQL 18).
- Terminal posicionado na pasta do backend:
  ```powershell
  cd back
  ```

---

## 2. Instalação de Dependências e Liberação de Binários Nativos

No npm 11+, scripts de pós-instalação (`argon2` e `@prisma/engines`) precisam de aprovação explícita para compilar seus binários nativos:

```powershell
npm install
npm install-scripts approve argon2 prisma @prisma/engines esbuild
npm rebuild argon2
```

---

## 3. Configuração das Variáveis de Ambiente (`.env`)

Antes de criar o `.env`, gere os certificados TLS do banco (uma vez; saem em `back/certs`, ignorado pelo git):

```powershell
powershell -File scripts/gerar-certs.ps1
```

Crie o arquivo `back/.env` com a string de conexão (TLS obrigatório), a chave de assinatura dos tokens JWT (HS256) e a chave mestra de criptografia dos dados em repouso:

```powershell
$chave = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
Set-Content .env @"
DATABASE_URL="postgresql://solum:solum_dev@localhost:5433/solum?schema=public&sslmode=verify-full&sslrootcert=./certs/ca.crt"
DB_SSL_CA=./certs/ca.crt
JWT_SECRET="chave-secreta-desenvolvimento-solum-2026"
ENCRYPTION_KEY=$chave
PORT=3333
"@
```

> [!CAUTION]
> `ENCRYPTION_KEY` (32 bytes em base64) cifra os dados pessoais do banco. **Se for perdida ou trocada, os dados cifrados ficam irrecuperáveis.** Guarde-a em local seguro (gerenciador de segredos), nunca a versione e use uma chave distinta por ambiente.

---

## 4. Subida do Banco de Dados PostgreSQL 18 (Docker)

```powershell
docker compose up -d
docker compose ps
```

O serviço `db` responderá na porta `localhost:5433` (usuário `solum`, senha `solum_dev` e database `solum`) **somente via TLS**: conexões sem SSL são rejeitadas pelo `postgres/pg_hba.conf`. O compose também sobe o proxy HTTPS (Caddy) na porta 443.

---

## 5. Aplicação das Migrations e Geração do Prisma Client

> [!IMPORTANT]
> Como o arquivo de configuração se chama `prisma7.config.ts`, sempre passe a flag `--config prisma7.config.ts` nos comandos do Prisma CLI.

```powershell
npx prisma migrate dev --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

Isso criará as 8 tabelas em Português do Brasil (`usuarios`, `veiculos`, `ofertas`, `propostas`, `contrapropostas`, `pedidos`, `fretes`, `notificacoes`), os 9 enums e as 11 restrições `CHECK` das regras **RN07** e **RN12**.

Há também duas migrations de criptografia em repouso (`..._cripto_campos_preparar` e `..._cripto_campos_finalizar`). Em um banco **novo** elas rodam normalmente em sequência. Em um banco **com dados já gravados**, siga o roteiro da seção 9 (a segunda migration aborta se ainda houver dados sem cifrar).

---

## 6. Execução do Seed (Dados de Teste Determinísticos)

Execute o script de seed idempotente para popular os 4 perfis de usuário, 2 ofertas ativas e 2 veículos de capacidades distintas:

```powershell
npm run seed
# ou diretamente:
npx tsx prisma/seed.ts
```

### Credenciais Criadas pelo Seed (RNF01 — Hash Argon2id)

Todos os usuários abaixo utilizam a mesma senha plana para testes: **`Senha@123`**

| Perfil (`PerfilUsuario`) | E-mail | Documento (oculto na API - RNF07) | Recursos pré-cadastrados |
|---|---|---|---|
| `ADMINISTRADOR` | `admin@solum.com.br` | `10000000000191` | Moderação de usuários e ofertas (RN09) |
| `PRODUTOR` | `produtor@solum.com.br` | `20000000000192` | Oferta Soja (`250 t`, ID `11111111-1111-4111-8111-111111111101`) e Oferta Milho (`120 t`, ID `11111111-1111-4111-8111-111111111102`) |
| `COMPRADOR` | `comprador@solum.com.br` | `30000000000193` | Pronto para Compra Direta ou envio de Propostas |
| `TRANSPORTADOR` | `transportador@solum.com.br` | `40000000000194` | `CARRETA` (`37.5 t`, ID `22222222-2222-4222-8222-222222222201`) e `VUC` (`3.5 t`, ID `22222222-2222-4222-8222-222222222202`) |

---

## 7. Inicialização do Servidor em Modo Desenvolvimento

```powershell
npm run dev
```

O servidor iniciará em `http://localhost:3333`:
- Healthcheck: `GET http://localhost:3333/health`
- Base da API REST: `http://localhost:3333/api`

---

## 8. Verificação de Tipos e Testes Rápidos via HTTP

Para validar a tipagem estática do TypeScript sem emitir arquivos:

```powershell
npx tsc --noEmit
```

Exemplo de login via PowerShell para obter o Bearer Token:

```powershell
$resp = Invoke-RestMethod -Method Post -Uri "http://localhost:3333/api/auth/login" -ContentType "application/json" -Body '{"email":"comprador@solum.com.br","senha":"Senha@123"}'
$token = $resp.token
```

---

## 9. Segurança de Dados (Criptografia em Trânsito e em Repouso)

### Em trânsito
- **Banco:** Postgres com TLS (mín. TLS 1.2); `pg_hba.conf` rejeita conexões sem SSL. A API valida o certificado (`DB_SSL_CA` + `sslmode=verify-full`).
- **Navegador:** com o front rodando (`npm run dev` em `front`), acesse `https://localhost` (proxy Caddy, HSTS ativo). O Vite repassa `/api` para a API. Em produção, use certificados de uma CA real e senha própria no banco.

### Em repouso (AES-256-GCM)
- Campos cifrados: `usuarios.documento`, `usuarios.whatsapp`, `pedidos.endereco_entrega`, `fretes.endereco_origem`, `fretes.endereco_destino`. Formato gravado: `enc:v1:<base64(iv|tag|cifra)>`.
- A cifragem/decifragem é **transparente**: acontece em `src/lib/prisma.ts` (usando `src/lib/cripto.ts`), então os services leem e gravam texto claro. SQL bruto (`$queryRaw`, `psql`) enxerga apenas o texto cifrado.
- `usuarios.documento_hash` é um índice cego (HMAC-SHA256 do documento): mantém a unicidade de CPF/CNPJ e a busca exata (`where: { documento }`) sem guardar o valor em claro. Em `create` de usuário, informe `documento_hash: indiceCego(documento)` (veja `usuario.service.ts` e `seed.ts`).
- Não é possível filtrar por `LIKE`, ordenar ou comparar os demais campos cifrados no banco.
- As chaves de cifra e do índice são derivadas (HKDF) de `ENCRYPTION_KEY`. Trocar a chave exige decifrar e recifrar todos os dados.

### Roteiro para um banco que já tem dados em texto puro
```powershell
docker compose exec -T -e PGPASSWORD=solum_dev db pg_dump -U solum -d solum -w > backups/solum-pre-cripto.sql   # 1. backup (pasta ignorada pelo git)
npx prisma migrate deploy --config prisma7.config.ts   # 2. aplica a etapa 1; a etapa 2 aborta enquanto houver dados sem índice
npm run cifrar-dados                                    # 3. cifra os dados existentes (idempotente)
npx prisma migrate deploy --config prisma7.config.ts   # 4. aplica a etapa 2 (documento_hash NOT NULL + UNIQUE)
```
Se o passo 2 já tiver aplicado as duas migrations com falha na segunda, rode `npx prisma migrate resolve --rolled-back 20261121100100_cripto_campos_finalizar --config prisma7.config.ts`, execute o passo 3 e repita o passo 4.
