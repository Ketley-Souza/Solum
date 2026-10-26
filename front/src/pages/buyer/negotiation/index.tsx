import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BadgeCheck, CalendarDays, CheckCircle2, CircleDollarSign, MapPin, Package, Send, ShieldCheck, Star, Wheat } from 'lucide-react'
import ProfileNavbar from '../../../components/ProfileNavbar'
import { offerService, type BackendOffer } from '../../../services/offerService'
import soja from '../../../assets/offer-soja.jpg'
import cafe from '../../../assets/offer-cafe.png'
import milho from '../../../assets/offer-milho.jpg'
import algodao from '../../../assets/offer-algodao.jpg'

type Product = { id: string; name: string; subtitle: string; description: string; location: string; price: number; available: number; unit: string; image: string; badge: string; seller: string }
const products: Product[] = [
  { id: '1', name: 'Soja Standard Tipo 1', subtitle: 'Lote SLM-2841 · 800 t disponíveis', description: 'Grão limpo e seco, padrão exportação. Umidade máxima de 13%, impurezas até 1% e rastreabilidade de origem disponível.', location: 'Rondonópolis, MT', price: 147, available: 800, unit: 'sc', image: soja, badge: 'GRÃOS · SAFRA 2026', seller: 'Rafael Souza' },
  { id: '2', name: 'Café arábica especial', subtitle: 'Bebida fina · 84 pontos', description: 'Café arábica selecionado, com origem identificada e classificação de qualidade.', location: 'Guaxupé, MG', price: 980, available: 60, unit: 'sc', image: cafe, badge: 'CAFÉ · SAFRA 2026', seller: 'Fazenda Bela Vista' },
  { id: '3', name: 'Milho safrinha seco', subtitle: 'Lote de 180 t · Tipo 1', description: 'Milho seco e classificado, disponível para negociação e retirada na origem.', location: 'Cascavel, PR', price: 64.5, available: 180, unit: 'sc', image: milho, badge: 'GRÃOS · SAFRA 2026', seller: 'Coop. Campo Sul' },
  { id: '4', name: 'Algodão pluma HVI', subtitle: 'Fibra 30,8 mm · Tipo 4-1', description: 'Algodão com classificação HVI e origem verificada.', location: 'Luís Eduardo, BA', price: 142, available: 42, unit: 'sc', image: algodao, badge: 'ALGODÃO · SAFRA 2026', seller: 'Verde Oeste' },
]
const money = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
function parsePrice(value: string) { const n = Number(value.replace(/[^\d,]/g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0 }
function toProduct(o: BackendOffer): Product {
  const unitName = o.unidade.toLowerCase()
  return {
    id: o.id,
    name: o.produto,
    subtitle: `${o.qualidade} · ${Number(o.quantidade)} ${o.unidade}`,
    description: o.descricao ?? '',
    location: o.localizacao,
    price: Number(o.preco),
    available: Number(o.quantidade),
    unit: unitName.startsWith('saca') ? 'sc' : unitName.startsWith('ton') ? 't' : 'kg',
    image: o.imagem_url || (o.categoria === 'Café' ? cafe : o.categoria === 'Milho' ? milho : o.categoria === 'Soja' ? soja : algodao),
    badge: `${o.categoria} · SAFRA ${o.safra}`.toUpperCase(),
    seller: o.produtor?.nome ?? 'Produtor',
  }
}

export default function BuyerNegotiationPage() {
  const { offerId } = useParams<{ offerId: string }>()
  const placeholder = products.find(p => p.id === offerId)
  const isReal = !placeholder
  const [remote, setRemote] = useState<Product | null>(null)
  const [notFound, setNotFound] = useState(false)
  const product = placeholder ?? remote ?? products[0]
  const [quantity, setQuantity] = useState('200')
  const [price, setPrice] = useState('142,00')
  const [address, setAddress] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  useEffect(() => {
    if (placeholder) return
    offerService.listActive().then(list => {
      const found = list.find(o => o.id === offerId)
      if (!found) { setNotFound(true); return }
      const next = toProduct(found)
      setRemote(next)
      setQuantity('1')
      setPrice(String(next.price).replace('.', ','))
    }).catch(() => setNotFound(true))
  }, [offerId, placeholder])
  const tons = Number(quantity) || 0
  const sacks = isReal ? tons : tons * 1000 / 60
  const offerPrice = parsePrice(price)
  const total = sacks * offerPrice
  const savings = sacks * (product.price - offerPrice)
  const valid = tons > 0 && tons <= product.available && offerPrice > 0 && (!isReal || address.trim().length >= 5)
  const quantityUnit = isReal ? product.unit : 'ton'
  async function send(buyNow: boolean) {
    if (!valid) return
    if (!isReal) {
      setFailed(false)
      setSubmitted(true)
      setMessage(buyNow ? 'Aceite demonstrativo registrado nesta página. Nenhum pagamento ou pedido real foi criado.' : 'Proposta demonstrativa registrada nesta página. Para enviar ao produtor de verdade, é necessário conectar ao back-end.')
      return
    }
    setBusy(true)
    try {
      if (buyNow) await offerService.buyNow({ oferta_id: product.id, quantidade: tons, endereco_entrega: address.trim() })
      else await offerService.propose({ oferta_id: product.id, quantidade: tons, preco: offerPrice, endereco_entrega: address.trim() })
      setFailed(false)
      setMessage(buyNow ? 'Pedido criado e salvo no banco de dados. Veja em Meus pedidos.' : 'Proposta enviada ao produtor e salva no banco de dados.')
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir a operação.')
    } finally {
      setSubmitted(true)
      setBusy(false)
    }
  }
  const details = useMemo(() => [
    { icon: Package, label: 'DISPONIBILIDADE', value: `${product.available} ${isReal ? product.unit : 'toneladas'}` },
    { icon: ShieldCheck, label: 'CONDIÇÃO', value: 'FOB fazenda' },
    { icon: CalendarDays, label: 'RETIRADA', value: '20–30 set. 2026' },
    { icon: CircleDollarSign, label: 'PAGAMENTO', value: 'À vista na entrega' },
  ], [product, isReal])

  if (isReal && !remote) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
        <p className="text-sm font-bold">{notFound ? 'Oferta não encontrada.' : 'Carregando oferta...'} <Link className="ml-2 underline" to="/comprador">Voltar ao marketplace</Link></p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName="João Ribeiro"
        role="COMPRADOR"
        notificationCount={3}
        notificationsHref="/comprador/notificacoes"
        links={[
          { label: 'Marketplace', href: '/comprador' },
          { label: 'Meus pedidos', href: '/comprador/pedidos' },
          { label: 'Negociações', href: '/comprador/negociacao/1' },
        ]}
      />

      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold text-[#708077]"><Link className="hover:underline" to="/comprador">Marketplace</Link> <span className="mx-2">›</span> Oferta #{isReal ? product.id.slice(0, 8).toUpperCase() : product.id === '1' ? 'SLM-2841' : `SLM-${2840 + Number(product.id)}`}</p><h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">Negocie direto com o produtor</h1><p className="mt-2 text-sm text-[#708077]">Revise o lote, ajuste sua proposta e acompanhe o valor estimado antes de enviar.</p></div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e8f5ce] px-4 py-2 text-xs font-bold text-[#287a48]"><span className="size-2 rounded-full bg-[#287a48]" /> Oferta ativa · válida até 15/09/2026</span>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
          <section className="rounded-[24px] border border-[#e0e6dd] bg-white p-5 shadow-[0_7px_20px_rgba(16,34,23,.06)]" aria-label="Detalhes do produto">
            <div className="relative overflow-hidden rounded-2xl"><img src={product.image} alt={product.name} className="h-56 w-full object-cover md:h-64" /><span className="absolute left-4 top-4 rounded-full bg-[#c1f23c] px-3 py-1.5 text-[10px] font-extrabold text-[#173b21]">{product.badge}</span><span className="absolute bottom-4 left-4 inline-flex items-center gap-1 text-xs font-bold text-white drop-shadow-md"><MapPin size={14} /> {product.location}</span></div>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold">{product.name}</h2><p className="mt-1 text-xs text-[#708077]">{product.subtitle}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase text-[#708077]">Preço publicado</p><p className="text-2xl font-extrabold text-[#173b21]">{money(product.price)}/{product.unit}</p></div></div>
            <p className="mt-3 text-sm leading-relaxed text-[#708077]">{product.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-[#f8f7f1] p-4">{details.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-start gap-2"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eaf0e4] text-[#287a48]"><Icon size={16} /></span><div><p className="text-[10px] font-bold text-[#708077]">{label}</p><p className="mt-1 text-xs font-extrabold">{value}</p></div></div>)}</div>
            <div className="mt-5 flex items-center gap-3 border-t border-[#e8ece4] pt-5"><span className="grid size-11 place-items-center rounded-full bg-[#e8f5ce] text-sm font-extrabold text-[#287a48]">RS</span><div className="min-w-0 flex-1"><p className="flex items-center gap-1 text-sm font-extrabold">{product.seller} <BadgeCheck size={15} className="text-[#287a48]" /></p><p className="text-xs text-[#708077]">Vendedor verificado · desde 2023</p></div><span className="inline-flex items-center gap-1 text-xs font-bold"><Star size={14} className="fill-[#e6a43a] text-[#e6a43a]" /> 4,8 <span className="font-normal text-[#708077]">· 34 avaliações</span></span></div>
          </section>

          <section className="rounded-[24px] border border-[#cfe0bb] bg-white p-6 shadow-[0_10px_25px_rgba(16,34,23,.08)] md:p-7" aria-label="Fazer proposta">
            <h2 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold">Fazer proposta</h2><p className="mt-1 text-sm text-[#708077]">Informe quantidade e preço por saca. Você poderá revisar tudo antes do fechamento.</p>
            <form onSubmit={event => { event.preventDefault(); void send(false) }}>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><label className="text-[11px] font-extrabold uppercase text-[#415247]">Quantidade ({quantityUnit})<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d4e2c4] px-3"><Wheat size={17} className="text-[#708077]" /><input type="number" min="0.01" max={product.available} step="0.01" value={quantity} onChange={event => { setQuantity(event.target.value); setSubmitted(false) }} className="w-full py-3 text-sm outline-none" /></div><span className="mt-1 block text-[11px] font-normal normal-case text-[#708077]">Equivale a {sacks.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {isReal ? product.unit : 'sacas de 60 kg'}</span></label>
              <label className="text-[11px] font-extrabold uppercase text-[#415247]">Preço ofertado (R$/{isReal ? product.unit : 'sc'})<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d4e2c4] px-3"><CircleDollarSign size={17} className="text-[#708077]" /><input type="text" inputMode="decimal" value={price} onChange={event => { setPrice(event.target.value); setSubmitted(false) }} className="w-full py-3 text-sm outline-none" /></div><span className="mt-1 block text-[11px] font-normal normal-case text-[#708077]">{money(product.price - offerPrice)} abaixo do preço publicado</span></label></div>
              <div className="mt-6 space-y-3 rounded-2xl border border-[#e6e9df] bg-[#f8f7f1] p-4 text-sm"><div className="flex justify-between gap-3 text-[#708077]"><span>Volume convertido</span><strong className="text-[#102217]">{sacks.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {isReal ? product.unit : 'sacas'}</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3 text-[#708077]"><span>Subtotal da mercadoria</span><strong className="text-[#102217]">{money(total)}</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3 text-[#708077]"><span>Frete</span><strong className="text-[#102217]">Calculado no fechamento</strong></div><div className="flex justify-between gap-3 border-t border-[#e6e9df] pt-3"><span>Total estimado</span><strong className="text-lg text-[#102217]">{money(total)}</strong></div></div>
              <div className="mt-5 rounded-xl bg-[#e8f5ce] px-4 py-3 text-xs font-semibold text-[#287a48]">{savings >= 0 ? `↘ Sua proposta representa uma economia estimada de ${money(savings)}.` : `Sua proposta está ${money(-savings)} acima do preço publicado.`}</div>
              {isReal && <label className="mt-4 block text-[11px] font-extrabold uppercase text-[#415247]">Endereço de entrega<input type="text" value={address} onChange={event => { setAddress(event.target.value); setSubmitted(false) }} placeholder="Rua, número, cidade e estado" className="mt-2 w-full rounded-xl border border-[#d4e2c4] px-3 py-3 text-sm font-normal normal-case outline-none" /></label>}
              {!valid && <p className="mt-3 text-xs font-semibold text-red-700">Informe uma quantidade entre 0 e {product.available} {isReal ? product.unit : 'toneladas'}, um preço maior que zero{isReal ? ' e o endereço de entrega' : ''}.</p>}
              <button type="submit" disabled={!valid || busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c1f23c] px-5 py-4 text-sm font-extrabold text-[#102217] transition hover:bg-[#d5fa73] disabled:cursor-not-allowed disabled:opacity-50">Enviar proposta <Send size={16} /></button>
              <button type="button" disabled={!valid || busy} onClick={() => void send(true)} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#173b21] px-5 py-3.5 text-sm font-bold transition hover:bg-[#f4f8ee] disabled:opacity-50">Aceitar preço publicado · {money(sacks * product.price)} <CheckCircle2 size={16} /></button>
              {submitted && <p role="status" className={`mt-3 rounded-xl p-3 text-xs font-semibold ${failed ? 'bg-red-50 text-red-700' : 'bg-[#e8f5ce] text-[#287a48]'}`}>{message}</p>}
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-[#eef2e8] p-3 text-[11px] text-[#708077]"><ShieldCheck size={17} className="shrink-0 text-[#287a48]" /> {isReal ? 'Oferta real: propostas e pedidos são gravados no banco de dados.' : 'Ambiente demonstrativo. Negociações reais exigem integração ao servidor.'}</p>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
