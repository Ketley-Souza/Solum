import { Router } from 'express'
import { PerfilUsuario } from '../generated/prisma/enums.js'
import { UnauthorizedError } from '../errors.js'
import { autenticar, type UsuarioAutenticado } from '../middlewares/autenticar.js'
import { autorizar } from '../middlewares/autorizar.js'
import {
  aceitarFreteSchema,
  alterarStatusOfertaSchema,
  alterarStatusUsuarioSchema,
  cadastroUsuarioSchema,
  compraDiretaSchema,
  criarContraPropostaSchema,
  criarOfertaSchema,
  criarPropostaSchema,
  criarVeiculoSchema,
  filtroFretesQuerySchema,
  filtroOfertasQuerySchema,
  loginSchema,
  parametroIdSchema,
} from '../schemas/dtos.js'
import {
  alterarStatusUsuario,
  autenticarUsuario,
  cadastrarUsuario,
} from '../services/usuario.service.js'
import {
  cadastrarVeiculo,
  desativarVeiculo,
  listarVeiculos,
} from '../services/veiculo.service.js'
import {
  alterarStatusOferta,
  criarOferta,
  listarOfertas,
  removerOfertaPorAdmin,
} from '../services/oferta.service.js'
import {
  aceitarContraProposta,
  aceitarProposta,
  contrapropor,
  criarProposta,
  listarPropostas,
  recusarContraProposta,
  recusarProposta,
} from '../services/proposta.service.js'
import { comprarDireto, listarPedidos } from '../services/pedido.service.js'
import {
  aceitarFrete,
  confirmarEntrega,
  iniciarTransporte,
  listarFretes,
} from '../services/frete.service.js'

export const apiRouter = Router()

function obterAtor(usuario: UsuarioAutenticado | undefined): UsuarioAutenticado {
  if (!usuario) throw new UnauthorizedError()
  return usuario
}

// =============================================================
// AUTENTICAÇÃO & USUÁRIOS (RNF01, RNF07, RN09, RN10)
// =============================================================

apiRouter.post('/auth/cadastro', async (req, res) => {
  const dados = cadastroUsuarioSchema.parse(req.body)
  const usuario = await cadastrarUsuario(dados)
  res.status(201).json(usuario)
})

apiRouter.post('/auth/login', async (req, res) => {
  const { email, senha } = loginSchema.parse(req.body)
  const resultado = await autenticarUsuario(email, senha)
  res.status(200).json(resultado)
})

apiRouter.patch(
  '/usuarios/:id/status',
  autenticar,
  autorizar(PerfilUsuario.ADMINISTRADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const { status } = alterarStatusUsuarioSchema.parse(req.body)
    const usuario = await alterarStatusUsuario(obterAtor(req.usuario), id, status)
    res.status(200).json(usuario)
  },
)

// =============================================================
// VEÍCULOS — FROTA DO TRANSPORTADOR (RN10, RN11, RN12)
// =============================================================

apiRouter.post(
  '/veiculos',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const dados = criarVeiculoSchema.parse(req.body)
    const veiculo = await cadastrarVeiculo(obterAtor(req.usuario), dados)
    res.status(201).json(veiculo)
  },
)

apiRouter.get(
  '/veiculos',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const veiculos = await listarVeiculos(obterAtor(req.usuario))
    res.status(200).json(veiculos)
  },
)

apiRouter.patch(
  '/veiculos/:id/desativar',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    await desativarVeiculo(obterAtor(req.usuario), id)
    res.status(200).json({ mensagem: 'Veículo desativado com sucesso' })
  },
)

// =============================================================
// OFERTAS (RN09, RN10, RN11, RN12)
// =============================================================

apiRouter.get('/ofertas', async (req, res) => {
  const { status } = filtroOfertasQuerySchema.parse(req.query)
  const ofertas = await listarOfertas(status)
  res.status(200).json(ofertas)
})

apiRouter.post(
  '/ofertas',
  autenticar,
  autorizar(PerfilUsuario.PRODUTOR),
  async (req, res) => {
    const dados = criarOfertaSchema.parse(req.body)
    const oferta = await criarOferta(obterAtor(req.usuario), dados)
    res.status(201).json(oferta)
  },
)

apiRouter.patch(
  '/ofertas/:id/status',
  autenticar,
  autorizar(PerfilUsuario.PRODUTOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const { status } = alterarStatusOfertaSchema.parse(req.body)
    await alterarStatusOferta(obterAtor(req.usuario), id, status)
    res.status(200).json({ mensagem: 'Status da oferta atualizado', status })
  },
)

apiRouter.patch(
  '/ofertas/:id/remover',
  autenticar,
  autorizar(PerfilUsuario.ADMINISTRADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    await removerOfertaPorAdmin(obterAtor(req.usuario), id)
    res.status(200).json({ mensagem: 'Oferta removida administrativamente' })
  },
)

// =============================================================
// PROPOSTAS & CONTRAPROPOSTAS — OPÇÃO (b) (RN06, RN10, RN11, RN12)
// =============================================================

apiRouter.get(
  '/propostas',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR, PerfilUsuario.PRODUTOR, PerfilUsuario.ADMINISTRADOR),
  async (req, res) => {
    const propostas = await listarPropostas(obterAtor(req.usuario))
    res.status(200).json(propostas)
  },
)

apiRouter.post(
  '/propostas',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR),
  async (req, res) => {
    const dados = criarPropostaSchema.parse(req.body)
    const resultado = await criarProposta(obterAtor(req.usuario), dados)
    res.status(201).json(resultado)
  },
)

apiRouter.post(
  '/propostas/:id/aceitar',
  autenticar,
  autorizar(PerfilUsuario.PRODUTOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const resultado = await aceitarProposta(obterAtor(req.usuario), id)
    res.status(200).json(resultado)
  },
)

apiRouter.post(
  '/propostas/:id/recusar',
  autenticar,
  autorizar(PerfilUsuario.PRODUTOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    await recusarProposta(obterAtor(req.usuario), id)
    res.status(200).json({ mensagem: 'Proposta recusada e pedido arquivado' })
  },
)

apiRouter.post(
  '/propostas/:id/contrapropor',
  autenticar,
  autorizar(PerfilUsuario.PRODUTOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const dados = criarContraPropostaSchema.parse(req.body)
    const contraProposta = await contrapropor(obterAtor(req.usuario), id, dados)
    res.status(201).json(contraProposta)
  },
)

apiRouter.post(
  '/contrapropostas/:id/aceitar',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const contraProposta = await aceitarContraProposta(obterAtor(req.usuario), id)
    res.status(200).json(contraProposta)
  },
)

apiRouter.post(
  '/contrapropostas/:id/recusar',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const contraProposta = await recusarContraProposta(obterAtor(req.usuario), id)
    res.status(200).json(contraProposta)
  },
)

// =============================================================
// PEDIDOS — COMPRA DIRETA & LISTAGEM (RN06, RN08, RN10, RN12)
// =============================================================

apiRouter.get(
  '/pedidos',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR, PerfilUsuario.PRODUTOR, PerfilUsuario.ADMINISTRADOR),
  async (req, res) => {
    const pedidos = await listarPedidos(obterAtor(req.usuario))
    res.status(200).json(pedidos)
  },
)

apiRouter.post(
  '/pedidos/compra-direta',
  autenticar,
  autorizar(PerfilUsuario.COMPRADOR),
  async (req, res) => {
    const dados = compraDiretaSchema.parse(req.body)
    const resultado = await comprarDireto(obterAtor(req.usuario), dados)
    res.status(201).json(resultado)
  },
)

// =============================================================
// FRETES — LOGÍSTICA & CONCORRÊNCIA (RN07, RN08, RN10)
// =============================================================

apiRouter.get(
  '/fretes',
  autenticar,
  async (req, res) => {
    const { status } = filtroFretesQuerySchema.parse(req.query)
    const fretes = await listarFretes(obterAtor(req.usuario), status)
    res.status(200).json(fretes)
  },
)

apiRouter.post(
  '/fretes/:id/aceitar',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const { veiculo_id } = aceitarFreteSchema.parse(req.body)
    const frete = await aceitarFrete(obterAtor(req.usuario), id, veiculo_id)
    res.status(200).json(frete)
  },
)

apiRouter.patch(
  '/fretes/:id/iniciar-transporte',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const frete = await iniciarTransporte(obterAtor(req.usuario), id)
    res.status(200).json(frete)
  },
)

apiRouter.patch(
  '/fretes/:id/confirmar-entrega',
  autenticar,
  autorizar(PerfilUsuario.TRANSPORTADOR),
  async (req, res) => {
    const { id } = parametroIdSchema.parse(req.params)
    const frete = await confirmarEntrega(obterAtor(req.usuario), id)
    res.status(200).json(frete)
  },
)
