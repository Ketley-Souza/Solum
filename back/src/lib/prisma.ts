import { readFileSync } from 'node:fs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { cifrar, decifrar, estaCifrado, indiceCego } from './cripto.js'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não definida no ambiente')

// Criptografia em trânsito: com DB_SSL_CA a conexão exige TLS e valida o certificado do servidor.
const caPath = process.env.DB_SSL_CA
const ssl = caPath ? { ca: readFileSync(caPath, 'utf8'), rejectUnauthorized: true } : undefined

// Criptografia em repouso: nomes de campo únicos no schema, cifrados de forma transparente.
const CAMPOS_CIFRADOS = new Set(['documento', 'whatsapp', 'endereco_entrega', 'endereco_origem', 'endereco_destino'])
const ARGS_DE_ESCRITA = ['data', 'create', 'update'] as const

const simples = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype

/** Escrita: cifra os campos sensíveis e mantém `documento_hash` (índice cego) em dia. */
function cifrarEscrita(no: unknown): unknown {
  if (Array.isArray(no)) return no.map(cifrarEscrita)
  if (!simples(no)) return no
  const saida: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(no)) {
    if (CAMPOS_CIFRADOS.has(chave) && typeof valor === 'string') {
      saida[chave] = cifrar(valor)
      if (chave === 'documento') saida.documento_hash = indiceCego(valor)
    } else {
      saida[chave] = cifrarEscrita(valor)
    }
  }
  return saida
}

/** Filtros: `documento` vira busca exata pelo índice cego. */
function traduzirFiltro(no: unknown): unknown {
  if (Array.isArray(no)) return no.map(traduzirFiltro)
  if (!simples(no)) return no
  const saida: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(no)) {
    if (chave === 'documento' && typeof valor === 'string') saida.documento_hash = indiceCego(valor)
    else saida[chave] = traduzirFiltro(valor)
  }
  return saida
}

/** Leitura: decifra recursivamente (inclui relações aninhadas). */
function decifrarResultado(no: unknown): unknown {
  if (Array.isArray(no)) return no.map(decifrarResultado)
  if (!simples(no)) return no
  const saida: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(no)) {
    saida[chave] =
      CAMPOS_CIFRADOS.has(chave) && typeof valor === 'string' && estaCifrado(valor)
        ? decifrar(valor)
        : decifrarResultado(valor)
  }
  return saida
}

const base = new PrismaClient({ adapter: new PrismaPg({ connectionString, ssl }) })

// Módulos ESM são avaliados uma única vez: esta instância é o singleton da aplicação.
// O tipo exposto é o do PrismaClient base (a extensão é transparente) para manter compatível o tipo
// `Prisma.TransactionClient` usado pelos services.
export const prisma = base.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        const a: Record<string, unknown> = { ...(args as Record<string, unknown>) }
        for (const chave of ARGS_DE_ESCRITA) if (chave in a) a[chave] = cifrarEscrita(a[chave])
        if ('where' in a) a.where = traduzirFiltro(a.where)
        return decifrarResultado(await query(a as typeof args))
      },
    },
  },
}) as unknown as PrismaClient
