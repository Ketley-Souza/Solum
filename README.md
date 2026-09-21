# Solum

Marketplace B2B web para negociação e escoamento da produção agrícola.

Integra **produtores**, **compradores** e **transportadores** em um único fluxo digital:
oferta → negociação → pedido → aceite de frete → entrega.

> Projeto de Intervenção — Projeto Integrador V (Extensão Curricularizada)
> Sistemas de Informação · Centro Universitário de Patos de Minas (UNIPAM)
> Orientador: Prof. Eder Manoel de Santana · Parceira: Transgrãos

## Problema
Na região de Patos de Minas, negociação e frete acontecem em canais dispersos
(telefone, mensagens), dificultando a conexão entre oferta, demanda e transporte.

## Escopo do MVP
- Cadastro/autenticação (produtor, comprador, transportador, admin)
- Publicação, busca e negociação de ofertas; fechamento de pedidos
- Aceite de frete e acompanhamento até a entrega
- Integração com API externa (consulta de CEP)
- Painel administrativo básico
- Interface responsiva, simples e acessível

## Stack
React · TypeScript · Tailwind CSS · Vite · Node.js · Express · PostgreSQL · Docker

## Estrutura
```
front/   aplicação web (React + Vite + Tailwind)
back/    API (Node.js + Express + TypeScript)
docs/    documentação (requisitos, arquitetura, protótipo, relatórios)
```

## Como rodar
Pré-requisitos: Node 24 (`.nvmrc`), Docker e Git.

```bash
docker compose up -d                       # PostgreSQL
cd back  && cp .env.example .env && npm install && npm run dev
cd front && npm install && npm run dev
```

## Equipe
Ana Clara Soares Ferreira · João Paulo Araujo Cunha · Ketley Souza Lopes ·
Maria Eduarda Ferreira Rocha · Pedro Felipe Gomes Farias
