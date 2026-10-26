import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Clock3, ShoppingBag, TrendingUp, Truck } from 'lucide-react'
import ProfileNavbar from '../../../components/ProfileNavbar'
import soja from '../../../assets/offer-soja.jpg'
import { orderService, type BackendOrder, type OrderStatus } from '../../../services/orderService'

type Status = 'Em andamento' | 'Aguardando ação' | 'Concluído' | 'Em separação'
type Order = { id: string; name: string; supplier: string; volume: string; total: string; status: Status; updated: string; image: string }
const STATUS_LABEL: Record<OrderStatus, Status> = {
  ABERTO: 'Aguardando ação',
  NEGOCIANDO: 'Aguardando ação',
  FECHADO: 'Em separação',
  EM_TRANSPORTE: 'Em andamento',
  ENTREGUE: 'Concluído',
}
const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
function toOrder(pedido: BackendOrder): Order {
  return {
    id: pedido.codigo,
    name: pedido.oferta.produto,
    supplier: pedido.oferta.produtor?.nome ?? '—',
    volume: `${Number(pedido.quantidade_final)} ${pedido.oferta.unidade}`,
    total: brl(Number(pedido.preco_final) * Number(pedido.quantidade_final)),
    status: STATUS_LABEL[pedido.status],
    updated: new Date(pedido.atualizado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
    image: pedido.oferta.imagem_url || soja,
  }
}
const filters = ['Todos', 'Em andamento', 'Aguardando ação', 'Concluídos', 'Cancelados'] as const
type Filter = typeof filters[number]

export default function BuyerOrdersPage() {
  const [filter, setFilter] = useState<Filter>('Todos')
  const [selected, setSelected] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  useEffect(() => {
    orderService.list().then((pedidos) => setOrders(pedidos.map(toOrder))).catch((e: Error) => setError(e.message))
  }, [])
  const inProgress = orders.filter((o) => o.status === 'Em andamento' || o.status === 'Em separação').length
  const waiting = orders.filter((o) => o.status === 'Aguardando ação').length
  const done = orders.filter((o) => o.status === 'Concluído').length
  const volume = orders.reduce((sum, o) => sum + Number(o.total.replace(/[^\d,]/g, '').replace(',', '.')), 0)
  const visibleOrders = useMemo(() => orders.filter((order) => {
    if (filter === 'Todos') return true
    if (filter === 'Concluídos') return order.status === 'Concluído'
    if (filter === 'Em andamento') return order.status === 'Em andamento' || order.status === 'Em separação'
    if (filter === 'Cancelados') return false
    return order.status === filter
  }), [filter, orders])

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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-[#287a48]">Conta compradora · Gestão de pedidos</p><h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">Meus pedidos</h1><p className="mt-1 text-xs text-[#708077]">Acompanhe contratos, entregas e documentos de todas as compras feitas pela sua operação.</p></div>
          <Link to="/comprador" className="inline-flex items-center gap-2 rounded-xl bg-[#c1f23c] px-5 py-3 text-xs font-extrabold hover:bg-[#d5fa73]">Explorar marketplace <ShoppingBag size={14} /></Link>
        </div>

        <section aria-label="Resumo dos pedidos" className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Em andamento', value: String(inProgress).padStart(2, '0'), detail: 'Em separação ou transporte', icon: Truck, dark: true },
            { label: 'Aguardando ação', value: String(waiting).padStart(2, '0'), detail: 'Contrato ou pagamento', icon: Clock3, dark: false },
            { label: 'Concluídos', value: String(done).padStart(2, '0'), detail: 'Entregas finalizadas', icon: CheckCircle2, dark: false },
            { label: 'Volume negociado', value: brl(volume), detail: 'Soma dos seus pedidos', icon: TrendingUp, dark: false },
          ].map(({ label, value, detail, icon: Icon, dark }) => (
            <div key={label} className={`min-h-36 rounded-2xl border p-5 ${dark ? 'border-[#173b21] bg-[#173b21] text-white' : 'border-[#e0e6dd] bg-white'}`}>
              <div className="flex items-center justify-between"><span className={`text-xs ${dark ? 'text-white/70' : 'text-[#708077]'}`}>{label}</span><span className={`grid size-9 place-items-center rounded-xl ${dark ? 'bg-white/10 text-[#c1f23c]' : 'bg-[#e9f5d1] text-[#377128]'}`}><Icon size={17} /></span></div>
              <strong className="mt-2 block font-['Bricolage_Grotesque'] text-3xl font-extrabold">{value}</strong><p className={`mt-1 text-[11px] ${dark ? 'text-white/60' : 'text-[#9aa79b]'}`}>{detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-9" aria-labelledby="history-title">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">Histórico completo</p><h2 id="history-title" className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold">Todos os pedidos</h2>
          <div className="mt-3 flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${filter === item ? 'border-[#173b21] bg-[#173b21] text-white' : 'border-[#e0e6dd] bg-white text-[#415247] hover:bg-[#eef2e8]'}`}>{item}{item === 'Todos' ? ` ${orders.length}` : item === 'Em andamento' ? ` ${inProgress}` : item === 'Aguardando ação' ? ` ${waiting}` : item === 'Concluídos' ? ` ${done}` : ''}</button>)}</div>
          <div className="mt-4 overflow-x-auto rounded-[20px] border border-[#e0e6dd] bg-white">
            <table className="w-full min-w-[720px] text-left"><thead className="bg-[#eef2e8] text-[10px] font-bold uppercase text-[#708077]"><tr><th className="px-4 py-3">Produto</th><th className="px-3 py-3">Pedido</th><th className="px-3 py-3">Volume</th><th className="px-3 py-3">Total</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Atualização</th><th className="px-3 py-3" aria-label="Detalhes" /></tr></thead><tbody>{visibleOrders.map((order) => <tr key={order.id} className="border-t border-[#e9ede7] text-xs"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={order.image} alt="" className="size-12 rounded-lg object-cover" /><div><strong className="block font-bold">{order.name}</strong><small className="text-[10px] text-[#708077]">{order.supplier}</small></div></div></td><td className="px-3 py-3 font-semibold">{order.id}</td><td className="px-3 py-3 text-[#708077]">{order.volume}</td><td className="px-3 py-3 font-bold">{order.total}</td><td className="px-3 py-3"><span className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] font-extrabold ${order.status === 'Concluído' ? 'bg-[#e2f5e7] text-[#287a48]' : order.status === 'Aguardando ação' ? 'bg-[#fff0d8] text-[#ad6a15]' : 'bg-[#e3f2f5] text-[#34788b]'}`}>{order.status.toUpperCase()}</span></td><td className="px-3 py-3 text-[11px] text-[#708077]">{order.updated}</td><td className="px-3 py-3"><button onClick={() => setSelected(order)} aria-label={`Ver detalhes de ${order.name}`} className="rounded-lg bg-[#f0f4eb] p-2 hover:bg-[#e1efce]"><ArrowRight size={15} /></button></td></tr>)}</tbody></table>
            {visibleOrders.length === 0 && <p className="p-8 text-center text-sm text-[#708077]">{error ? error : 'Nenhum pedido nesta categoria.'}</p>}
          </div>
        </section>
      </main>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-label="Detalhes do pedido" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><p className="text-xs text-[#708077]">{selected.id}</p><h2 className="mt-1 text-xl font-extrabold">{selected.name}</h2></div><button onClick={() => setSelected(null)} className="rounded-lg bg-[#eef2e8] px-3 py-1.5 text-sm font-bold">Fechar</button></div><img src={selected.image} alt="" className="mt-4 h-40 w-full rounded-xl object-cover" /><p className="mt-4 text-sm"><strong>Fornecedor:</strong> {selected.supplier}</p><p className="mt-2 text-sm"><strong>Volume:</strong> {selected.volume}</p><p className="mt-2 text-sm"><strong>Total:</strong> {selected.total}</p><p className="mt-2 text-sm"><strong>Status:</strong> {selected.status}</p></section></div>}
    </div>
  )
}
