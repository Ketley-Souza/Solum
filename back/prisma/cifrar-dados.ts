import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { cifrar, estaCifrado, indiceCego } from '../src/lib/cripto.js'

/**
 * Cifra os dados pessoais já gravados em texto puro. Idempotente: valores com prefixo `enc:v1:` são ignorados.
 * SQL bruto não passa pela camada transparente de src/lib/prisma.ts, então lemos e gravamos o valor como está.
 */
const novo = (valor: string) => (estaCifrado(valor) ? valor : cifrar(valor))

await prisma.$transaction(async (tx) => {
  const usuarios = await tx.$queryRaw<{ id: string; documento: string; whatsapp: string; documento_hash: string | null }[]>`
    SELECT id, documento, whatsapp, documento_hash FROM usuarios`
  let alterados = 0
  for (const u of usuarios) {
    if (estaCifrado(u.documento) && u.documento_hash && estaCifrado(u.whatsapp)) continue
    if (estaCifrado(u.documento) && !u.documento_hash) throw new Error(`Usuário ${u.id}: documento cifrado sem índice; restaure o backup.`)
    const hash = u.documento_hash ?? indiceCego(u.documento)
    await tx.$executeRaw`UPDATE usuarios SET documento = ${novo(u.documento)}, whatsapp = ${novo(u.whatsapp)}, documento_hash = ${hash} WHERE id = ${u.id}::uuid`
    alterados++
  }
  console.log(`usuarios: ${alterados} de ${usuarios.length} cifrados`)

  const pedidos = await tx.$queryRaw<{ id: string; endereco_entrega: string }[]>`SELECT id, endereco_entrega FROM pedidos`
  let nPedidos = 0
  for (const p of pedidos) {
    if (estaCifrado(p.endereco_entrega)) continue
    await tx.$executeRaw`UPDATE pedidos SET endereco_entrega = ${cifrar(p.endereco_entrega)} WHERE id = ${p.id}::uuid`
    nPedidos++
  }
  console.log(`pedidos: ${nPedidos} de ${pedidos.length} cifrados`)

  const fretes = await tx.$queryRaw<{ id: string; endereco_origem: string; endereco_destino: string }[]>`
    SELECT id, endereco_origem, endereco_destino FROM fretes`
  let nFretes = 0
  for (const f of fretes) {
    if (estaCifrado(f.endereco_origem) && estaCifrado(f.endereco_destino)) continue
    await tx.$executeRaw`UPDATE fretes SET endereco_origem = ${novo(f.endereco_origem)}, endereco_destino = ${novo(f.endereco_destino)} WHERE id = ${f.id}::uuid`
    nFretes++
  }
  console.log(`fretes: ${nFretes} de ${fretes.length} cifrados`)
})

await prisma.$disconnect()
