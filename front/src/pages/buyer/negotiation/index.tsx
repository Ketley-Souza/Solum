import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Info,
  MapPin,
  Package,
  Send,
  ShieldCheck,
  Star,
  Wheat,
} from 'lucide-react'
import ProfileNavbar from '../../../components/ProfileNavbar'
import { offerService, type BackendOffer } from '../../../services/offerService'
import { useAuthStore } from '../../../stores/authStore'
import soja from '../../../assets/offer-soja.jpg'
import cafe from '../../../assets/offer-cafe.png'
import milho from '../../../assets/offer-milho.jpg'
import algodao from '../../../assets/offer-algodao.jpg'

type AvailabilityState = 'available' | 'upcoming' | 'expired' | 'unknown'
type Product = {
  id: string
  name: string
  description: string
  location: string
  price: number
  available: number
  unit: string
  image: string
  category: string
  quality: string
  harvest: string
  seller: string
  period: string
  status: string
}
type Availability = {
  start: Date | null
  end: Date | null
  label: string
  state: AvailabilityState
}

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

function localDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  date.setHours(0, 0, 0, 0)
  return date
}

function parseDate(value: string): Date | null {
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return localDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const br = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (br) return localDate(Number(br[3]), Number(br[2]), Number(br[1]))
  return null
}

function getAvailability(period: string): Availability {
  const value = (period || '').trim()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!value) return { start: null, end: null, label: 'Período não informado', state: 'unknown' }

  const dates = value.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g)
  if (!dates || dates.length < 2) {
    return { start: null, end: null, label: value, state: 'unknown' }
  }

  const start = parseDate(dates[0])
  const end = parseDate(dates[1])
  if (!start || !end || end < start) {
    return { start: null, end: null, label: value, state: 'unknown' }
  }

  const label = `${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`
  if (end < today) return { start, end, label, state: 'expired' }
  if (start > today) return { start, end, label, state: 'upcoming' }
  return { start, end, label, state: 'available' }
}

function getImage(offer: BackendOffer): string {
  if (offer.imagem_url) return offer.imagem_url
  const category = `${offer.produto} ${offer.categoria}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (category.includes('cafe')) return cafe
  if (category.includes('milho')) return milho
  if (category.includes('algodao')) return algodao
  return soja
}

function toProduct(offer: BackendOffer): Product {
  return {
    id: offer.id,
    name: offer.produto,
    description: offer.descricao || '',
    location: offer.localizacao,
    price: Number(offer.preco),
    available: Number(offer.quantidade),
    unit: offer.unidade,
    image: getImage(offer),
    category: offer.categoria,
    quality: offer.qualidade,
    harvest: offer.safra,
    seller: offer.produtor?.nome || 'Produtor',
    period: offer.periodo || '',
    status: offer.status,
  }
}

function unitShort(unit: string): string {
  const value = unit.toLowerCase()
  if (value.includes('saca')) return 'sc'
  if (value.includes('ton')) return 't'
  if (value === 'kg' || value.includes('quilo')) return 'kg'
  return unit
}

export default function BuyerNegotiationPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const user = useAuthStore((state) => state.user)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [failed, setFailed] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setNotFound(false)
      setProduct(null)
      try {
        if (!offerId) throw new Error('Identificador da oferta ausente.')
        const offers = await offerService.listActive()
        const found = offers.find((offer) => offer.id === offerId)
        if (!found) {
          if (mounted) setNotFound(true)
          return
        }
        const mapped = toProduct(found)
        if (mounted) {
          setProduct(mapped)
          setQuantity('1')
          setPrice(String(mapped.price))
        }
      } catch {
        if (mounted) setNotFound(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void load()
    return () => { mounted = false }
  }, [offerId])

  const availability = useMemo(() => getAvailability(product?.period || ''), [product?.period])
  const quantityValue = Number(quantity)
  const priceValue = Number(price.replace(',', '.'))
  const validNumbers = Number.isFinite(quantityValue) && Number.isFinite(priceValue)
  const subtotal = validNumbers ? quantityValue * priceValue : 0
  const savings = product ? quantityValue * (product.price - priceValue) : 0
  const activeStatus = product?.status === 'ATIVA'
  const canNegotiate = Boolean(
    product && activeStatus && availability.state === 'available' && validNumbers &&
    quantityValue > 0 && quantityValue <= product.available && priceValue > 0 && address.trim().length >= 5
  )

  async function sendProposal(direct: boolean) {
    if (!product || !canNegotiate || busy) return
    setBusy(true)
    setSubmitted(false)
    try {
      if (direct) {
        await offerService.buyNow({ oferta_id: product.id, quantidade: quantityValue, endereco_entrega: address.trim() })
        setMessage('Pedido criado com sucesso. Consulte a página Meus pedidos.')
      } else {
        await offerService.propose({ oferta_id: product.id, quantidade: quantityValue, preco: priceValue, endereco_entrega: address.trim() })
        setMessage('Proposta enviada ao produtor com sucesso.')
      }
      setFailed(false)
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    } finally {
      setBusy(false)
      setSubmitted(true)
    }
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#f7f8f3] text-sm font-bold text-[#102217]">Carregando oferta...</div>
  }

  if (notFound || !product) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f3] px-5 text-center text-[#102217]">
        <div><h1 className="text-2xl font-extrabold">Oferta não encontrada</h1><p className="mt-2 text-sm text-[#708077]">A oferta não está disponível no Marketplace ou foi removida.</p><Link to="/comprador" className="mt-5 inline-block rounded-xl bg-[#c1f23c] px-5 py-3 text-sm font-bold">Voltar ao Marketplace</Link></div>
      </div>
    )
  }

  const available = activeStatus && availability.state === 'available'
  const statusText = !activeStatus ? 'Oferta inativa' : availability.state === 'expired' ? 'Oferta vencida' : availability.state === 'upcoming' ? 'Disponibilidade futura' : availability.state === 'unknown' ? 'Período não confirmado' : 'Oferta disponível'
  const statusMessage = !activeStatus ? 'Esta oferta não está ativa.' : availability.state === 'expired' ? 'O período de disponibilidade desta oferta terminou. Não é possível enviar propostas.' : availability.state === 'upcoming' ? `A oferta estará disponível a partir de ${availability.start?.toLocaleDateString('pt-BR')}.` : availability.state === 'unknown' ? 'O período cadastrado não pôde ser interpretado. Peça ao produtor que atualize as datas antes de negociar.' : 'Oferta dentro do período informado pelo produtor.'

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName={user?.name || 'Comprador'} role="COMPRADOR" links={[{ label: 'Marketplace', href: '/comprador' }, { label: 'Meus pedidos', href: '/comprador/pedidos' }]} notificationsHref="/comprador/notificacoes" />
      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold text-[#708077]"><Link to="/comprador">Marketplace</Link><span className="mx-2">›</span>Oferta #{product.id.slice(0, 8).toUpperCase()}</p><h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">Negocie direto com o produtor</h1><p className="mt-2 text-sm text-[#708077]">Consulte as condições do lote e revise sua proposta antes de enviar.</p></div>
          <span className={`rounded-full px-4 py-2 text-xs font-bold ${available ? 'bg-[#e8f5ce] text-[#287a48]' : 'bg-red-50 text-red-700'}`}>{statusText}</span>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
          <section className="rounded-[24px] border border-[#e0e6dd] bg-white p-5 shadow-sm">
            <div className="relative overflow-hidden rounded-2xl"><img src={product.image} alt={product.name} className="h-56 w-full object-cover md:h-64" /><span className="absolute left-4 top-4 rounded-full bg-[#c1f23c] px-3 py-1.5 text-[10px] font-extrabold">{product.category} · SAFRA {product.harvest}</span><span className="absolute bottom-4 left-4 flex items-center gap-1 text-xs font-bold text-white drop-shadow"><MapPin size={14}/>{product.location}</span></div>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-extrabold">{product.name}</h2><p className="mt-1 text-xs text-[#708077]">{product.quality}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase text-[#708077]">Preço publicado</p><p className="text-2xl font-extrabold">{money(product.price)}/{unitShort(product.unit)}</p></div></div>
            {product.description && <p className="mt-3 text-sm leading-relaxed text-[#708077]">{product.description}</p>}
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[#f8f7f1] p-4">
              <div className="flex items-start gap-2"><Package size={18}/><div><p className="text-[10px] font-bold text-[#708077]">QUANTIDADE DISPONÍVEL</p><p className="mt-1 text-xs font-extrabold">{product.available} {product.unit}</p></div></div>
              <div className="flex items-start gap-2"><CalendarDays size={18}/><div><p className="text-[10px] font-bold text-[#708077]">PERÍODO DE DISPONIBILIDADE</p><p className="mt-1 text-xs font-extrabold">{availability.label}</p></div></div>
              <div className="flex items-start gap-2"><ShieldCheck size={18}/><div><p className="text-[10px] font-bold text-[#708077]">CONDIÇÃO</p><p className="mt-1 text-xs font-extrabold">Contratação de frete pela plataforma</p></div></div>
              <div className="flex items-start gap-2"><CircleDollarSign size={18}/><div><p className="text-[10px] font-bold text-[#708077]">PAGAMENTO</p><p className="mt-1 text-xs font-extrabold">À vista na entrega</p></div></div>
            </div>
            <div className="mt-5 flex items-center gap-3 border-t border-[#e8ece4] pt-5"><span className="grid size-11 place-items-center rounded-full bg-[#e8f5ce] text-sm font-extrabold">{product.seller.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="text-sm font-extrabold">{product.seller}</p><span className="text-xs text-[#708077]">Vendedor • desde 2026</span></div><div className="text-right"><span className="inline-flex items-center gap-1 text-xs text-[#708077]"></span></div></div>
          </section>

          <section className="rounded-[24px] border border-[#cfe0bb] bg-white p-6 shadow-sm md:p-7">
            <h2 className="text-2xl font-extrabold">Fazer proposta</h2><p className="mt-1 text-sm text-[#708077]">Informe a quantidade e o preço por unidade cadastrada na oferta.</p>
            <form onSubmit={(event) => { event.preventDefault(); void sendProposal(false) }}>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <label className="text-[11px] font-extrabold uppercase text-[#415247]">Quantidade ({unitShort(product.unit)})<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d4e2c4] px-3"><Wheat size={17}/><input type="number" min="0.01" max={product.available} step="0.01" value={quantity} disabled={!available || busy} onChange={(event) => {setQuantity(event.target.value);setSubmitted(false)}} className="w-full py-3 text-sm outline-none"/></div><span className="mt-1 block text-[11px] font-normal normal-case text-[#708077]">Máximo: {product.available} {product.unit}</span></label>
                <label className="text-[11px] font-extrabold uppercase text-[#415247]">Preço ofertado (R$/{unitShort(product.unit)})<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d4e2c4] px-3"><CircleDollarSign size={17}/><input type="number" min="0.01" step="0.01" value={price} disabled={!available || busy} onChange={(event) => {setPrice(event.target.value);setSubmitted(false)}} className="w-full py-3 text-sm outline-none"/></div><span className="mt-1 block text-[11px] font-normal normal-case text-[#708077]">Preço publicado: {money(product.price)}</span></label>
              </div>
              <div className="mt-6 space-y-3 rounded-2xl border border-[#e6e9df] bg-[#f8f7f1] p-4 text-sm"><div className="flex justify-between gap-3 text-[#708077]"><span>Quantidade</span><strong className="text-[#102217]">{quantityValue || 0} {product.unit}</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3 text-[#708077]"><span>Subtotal da mercadoria</span><strong className="text-[#102217]">{money(subtotal)}</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3 text-[#708077]"><span>Frete</span><strong className="text-[#102217]">A definir</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3"><span className="font-bold">Total estimado*</span><strong className="text-lg">{money(subtotal)}</strong></div><p className="text-[10px] text-[#708077]">*Não inclui frete, impostos ou custos adicionais.</p></div>
              <div className="mt-5 rounded-xl bg-[#e8f5ce] px-4 py-3 text-xs font-semibold text-[#287a48]">{savings >= 0 ? `Sua proposta está ${money(savings)} abaixo do preço publicado.` : `Sua proposta está ${money(Math.abs(savings))} acima do preço publicado.`}</div>
              <label className="mt-5 block text-[11px] font-extrabold uppercase text-[#415247]">Endereço de entrega<input type="text" value={address} disabled={!available || busy} onChange={(event) => {setAddress(event.target.value);setSubmitted(false)}} placeholder="Rua, número, cidade e estado" className="mt-2 w-full rounded-xl border border-[#d4e2c4] px-3 py-3 text-sm font-normal normal-case outline-none"/></label>
              {available && quantityValue > product.available && <p className="mt-3 text-xs font-semibold text-red-700">A quantidade ultrapassa o estoque disponível.</p>}
              {available && quantityValue <= 0 && <p className="mt-3 text-xs font-semibold text-red-700">Informe uma quantidade maior que zero.</p>}
              {available && address.trim().length < 5 && <p className="mt-3 text-xs font-semibold text-red-700">Informe um endereço válido.</p>}
              <button type="submit" disabled={!canNegotiate || busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c1f23c] px-5 py-4 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Enviando...' : 'Enviar proposta'}<Send size={16}/></button>
              <button type="button" disabled={!canNegotiate || busy} onClick={() => void sendProposal(true)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#173b21] px-5 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50">Aceitar preço publicado · {money(quantityValue * product.price)}<CheckCircle2 size={16}/></button>
              {submitted && <p role="status" className={`mt-3 rounded-xl p-3 text-xs font-semibold ${failed ? 'bg-red-50 text-red-700' : 'bg-[#e8f5ce] text-[#287a48]'}`}>{message}</p>}
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
