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

Crie o arquivo `back/.env` com a string de conexão correspondente ao `docker-compose.yml` e uma chave secreta para assinatura dos tokens JWT (HS256):

```powershell
Set-Content .env @"
DATABASE_URL="postgresql://solum:solum_dev@localhost:5432/solum?schema=public"
JWT_SECRET="chave-secreta-desenvolvimento-solum-2026"
PORT=3333
"@
```

---

## 4. Subida do Banco de Dados PostgreSQL 18 (Docker)

```powershell
docker compose up -d
docker compose ps
```

O serviço `db` responderá na porta `localhost:5432` com usuário `solum`, senha `solum_dev` e database `solum`.

---

## 5. Aplicação das Migrations e Geração do Prisma Client

> [!IMPORTANT]
> Como o arquivo de configuração se chama `prisma7.config.ts`, sempre passe a flag `--config prisma7.config.ts` nos comandos do Prisma CLI.

```powershell
npx prisma migrate dev --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
```

Isso criará as 8 tabelas em Português do Brasil (`usuarios`, `veiculos`, `ofertas`, `propostas`, `contrapropostas`, `pedidos`, `fretes`, `notificacoes`), os 9 enums e as 11 restrições `CHECK` das regras **RN07** e **RN12**.

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
