import { z } from 'zod'
import {
  PerfilUsuario,
  StatusFrete,
  StatusOferta,
  StatusUsuario,
  TipoVeiculo,
} from '../generated/prisma/enums.js'

const numeroPositivo = z.coerce.number().gt(0, 'O valor deve ser estritamente maior que zero')

export const parametroIdSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido'),
})

export const cadastroUsuarioSchema = z.object({
  nome: z.string().trim().min(2).max(150),
  documento: z.string().regex(/^(?:\d{11}|\d{14})$/, 'Documento deve conter 11 (CPF) ou 14 (CNPJ) dígitos numéricos'),
  whatsapp: z.string().trim().min(8).max(20),
  email: z.email('E-mail inválido').max(254),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').max(128),
  perfil: z.enum(PerfilUsuario),
})

export const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
})

export const alterarStatusUsuarioSchema = z.object({
  status: z.enum(StatusUsuario),
})

export const criarVeiculoSchema = z.object({
  tipo_veiculo: z.enum(TipoVeiculo),
  capacidade_toneladas: numeroPositivo,
})

export const criarOfertaSchema = z.object({
  produto: z.string().trim().min(2).max(120),
  categoria: z.string().trim().min(2).max(80),
  qualidade: z.string().trim().min(1).max(80),
  safra: z.string().trim().min(4).max(20),
  quantidade: numeroPositivo,
  unidade: z.string().trim().min(1).max(20),
  preco: numeroPositivo,
  localizacao: z.string().trim().min(2).max(200),
  periodo: z.string().trim().min(2).max(80),
  descricao: z.string().trim().max(2000).nullish(),
  imagem_url: z.url('URL de imagem inválida').nullish(),
})

export const alterarStatusOfertaSchema = z.object({
  status: z.enum(StatusOferta),
})

export const filtroOfertasQuerySchema = z.object({
  status: z.enum(StatusOferta).optional(),
})

export const criarPropostaSchema = z.object({
  oferta_id: z.uuid('oferta_id deve ser um UUID válido'),
  quantidade: numeroPositivo,
  preco: numeroPositivo,
  endereco_entrega: z.string().trim().min(5).max(300),
})

export const criarContraPropostaSchema = z.object({
  preco: numeroPositivo,
  quantidade: numeroPositivo,
  mensagem: z.string().trim().max(1000).nullish(),
})

export const compraDiretaSchema = z.object({
  oferta_id: z.uuid('oferta_id deve ser um UUID válido'),
  quantidade: numeroPositivo,
  endereco_entrega: z.string().trim().min(5).max(300),
})

export const aceitarFreteSchema = z.object({
  veiculo_id: z.uuid('veiculo_id deve ser um UUID válido'),
})

export const filtroFretesQuerySchema = z.object({
  status: z.enum(StatusFrete).optional(),
})
