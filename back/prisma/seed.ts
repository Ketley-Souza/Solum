import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import { gerarHashSenha } from '../src/lib/senha.js'
import {
  PerfilUsuario,
  StatusOferta,
  StatusUsuario,
  TipoVeiculo,
} from '../src/generated/prisma/enums.js'

const SENHA_PADRAO = 'Senha@123'

const IDS = {
  ofertaSoja: '11111111-1111-4111-8111-111111111101',
  ofertaMilho: '11111111-1111-4111-8111-111111111102',
  veiculoCarreta: '22222222-2222-4222-8222-222222222201',
  veiculoVuc: '22222222-2222-4222-8222-222222222202',
} as const

async function main(): Promise<void> {
  const senhaHash = await gerarHashSenha(SENHA_PADRAO)

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@solum.com.br' },
    update: { nome: 'Administrador Solum', senha_hash: senhaHash, status: StatusUsuario.ATIVO, excluido_em: null },
    create: {
      nome: 'Administrador Solum',
      documento: '10000000000191',
      whatsapp: '11999990001',
      email: 'admin@solum.com.br',
      senha_hash: senhaHash,
      perfil: PerfilUsuario.ADMINISTRADOR,
    },
  })

  const produtor = await prisma.usuario.upsert({
    where: { email: 'produtor@solum.com.br' },
    update: { nome: 'Fazenda Boa Vista (Produtor)', senha_hash: senhaHash, status: StatusUsuario.ATIVO, excluido_em: null },
    create: {
      nome: 'Fazenda Boa Vista (Produtor)',
      documento: '20000000000192',
      whatsapp: '65999990002',
      email: 'produtor@solum.com.br',
      senha_hash: senhaHash,
      perfil: PerfilUsuario.PRODUTOR,
    },
  })

  const comprador = await prisma.usuario.upsert({
    where: { email: 'comprador@solum.com.br' },
    update: { nome: 'Agroindústria Sul (Comprador)', senha_hash: senhaHash, status: StatusUsuario.ATIVO, excluido_em: null },
    create: {
      nome: 'Agroindústria Sul (Comprador)',
      documento: '30000000000193',
      whatsapp: '41999990003',
      email: 'comprador@solum.com.br',
      senha_hash: senhaHash,
      perfil: PerfilUsuario.COMPRADOR,
    },
  })

  const transportador = await prisma.usuario.upsert({
    where: { email: 'transportador@solum.com.br' },
    update: { nome: 'TransGrãos Logística (Transportador)', senha_hash: senhaHash, status: StatusUsuario.ATIVO, excluido_em: null },
    create: {
      nome: 'TransGrãos Logística (Transportador)',
      documento: '40000000000194',
      whatsapp: '66999990004',
      email: 'transportador@solum.com.br',
      senha_hash: senhaHash,
      perfil: PerfilUsuario.TRANSPORTADOR,
    },
  })

  const ofertaSoja = await prisma.oferta.upsert({
    where: { id: IDS.ofertaSoja },
    update: { status: StatusOferta.ATIVA, excluido_em: null },
    create: {
      id: IDS.ofertaSoja,
      produtor_id: produtor.id,
      produto: 'Soja em Grãos Padrão Exportação',
      categoria: 'Grãos',
      qualidade: 'Tipo 1 - Umidade máx 14%',
      safra: '2026/2027',
      quantidade: '250.000',
      unidade: 't',
      preco: '2150.00',
      localizacao: 'Sorriso - MT',
      periodo: 'Outubro/2026',
      descricao: 'Lote homogêneo armazenado em silo próprio, pronto para embarque.',
      status: StatusOferta.ATIVA,
    },
  })

  const ofertaMilho = await prisma.oferta.upsert({
    where: { id: IDS.ofertaMilho },
    update: { status: StatusOferta.ATIVA, excluido_em: null },
    create: {
      id: IDS.ofertaMilho,
      produtor_id: produtor.id,
      produto: 'Milho Safrinha Seco',
      categoria: 'Grãos',
      qualidade: 'Padrão Comercial',
      safra: '2026/2026',
      quantidade: '120.000',
      unidade: 't',
      preco: '1100.00',
      localizacao: 'Sinop - MT',
      periodo: 'Imediato',
      descricao: 'Milho limpo e seco para ração ou indústria.',
      status: StatusOferta.ATIVA,
    },
  })

  const veiculoCarreta = await prisma.veiculo.upsert({
    where: { id: IDS.veiculoCarreta },
    update: { excluido_em: null },
    create: {
      id: IDS.veiculoCarreta,
      transportador_id: transportador.id,
      tipo_veiculo: TipoVeiculo.CARRETA,
      capacidade_toneladas: '37.500',
    },
  })

  const veiculoVuc = await prisma.veiculo.upsert({
    where: { id: IDS.veiculoVuc },
    update: { excluido_em: null },
    create: {
      id: IDS.veiculoVuc,
      transportador_id: transportador.id,
      tipo_veiculo: TipoVeiculo.VUC,
      capacidade_toneladas: '3.500',
    },
  })

  console.log('Seed concluído com sucesso:')
  console.log({
    senhaPadrao: SENHA_PADRAO,
    usuarios: [
      { email: admin.email, perfil: admin.perfil, id: admin.id },
      { email: produtor.email, perfil: produtor.perfil, id: produtor.id },
      { email: comprador.email, perfil: comprador.perfil, id: comprador.id },
      { email: transportador.email, perfil: transportador.perfil, id: transportador.id },
    ],
    ofertas: [
      { id: ofertaSoja.id, produto: ofertaSoja.produto, quantidade_t: ofertaSoja.quantidade.toString() },
      { id: ofertaMilho.id, produto: ofertaMilho.produto, quantidade_t: ofertaMilho.quantidade.toString() },
    ],
    veiculos: [
      { id: veiculoCarreta.id, tipo: veiculoCarreta.tipo_veiculo, capacidade_t: veiculoCarreta.capacidade_toneladas.toString() },
      { id: veiculoVuc.id, tipo: veiculoVuc.tipo_veiculo, capacidade_t: veiculoVuc.capacidade_toneladas.toString() },
    ],
  })
}

main()
  .catch((err) => {
    console.error('Erro ao executar seed:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
