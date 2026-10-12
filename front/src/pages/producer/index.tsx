import ProfileNavbar from '../../components/ProfileNavbar'
import cafeImage from '../../assets/offer-cafe.png'
import milhoImage from '../../assets/offer-milho.jpg'
import { Handshake, PackageOpen, Plus, Scale } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const metrics: [LucideIcon, string, string, string][] = [
  [PackageOpen, '+1 esta semana', '4', 'Ofertas ativas'],
  [Handshake, '2 aguardam você', '3', 'Negociações em andamento'],
  [Scale, '+18% no mês', 'R$ 45K', 'Volume negociado em setembro'],
]

export default function ProducerPage() {
  return (
    <div id="topo" className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName="João Ribeiro" role="PRODUTOR" links={[{ label: 'Visão geral', href: '#topo' }, { label: 'Ofertas', href: '#ofertas' }, { label: 'Negociações', href: '#negociacoes' }, { label: 'Pedidos', href: '#pedidos' }]} />
      <main className="flex flex-col gap-6 px-5 pb-10 pt-8 md:px-12">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div><p className="text-[11px] font-bold uppercase text-[#2f681f]">Domingo, 27 de setembro</p><h1 className="mt-1 font-['Bricolage_Grotesque'] text-4xl font-extrabold">Bom dia, João!</h1><p className="mt-1 text-sm text-[#708077]">Fazenda Boa Vista • Patos de Minas, MG</p></div>
          <button className="flex cursor-pointer self-start items-center gap-2 rounded-xl bg-[#2f681f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3b8128] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"><Plus size={16} strokeWidth={2.5} />Nova oferta</button>
        </div>
        <section className="grid gap-4 md:grid-cols-3">{metrics.map(([MetricIcon, status, value, label]) => <article className="rounded-2xl border border-[#dde3da] bg-white p-5 shadow-[0_4px_16px_rgba(16,34,23,.05)]" key={label}><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#eef5e8] text-[#287a48]"><MetricIcon size={19} strokeWidth={2} /></span><span className="rounded-full bg-[#e3f3e8] px-2.5 py-1 text-xs font-bold text-[#287a48]">{status}</span></div><strong className="mt-4 block font-['Bricolage_Grotesque'] text-3xl font-extrabold">{value}</strong><p className="mt-2 text-sm font-extrabold text-[#708077]">{label}</p></article>)}</section>
        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div id="ofertas" className="rounded-2xl border border-[#dde3da] bg-white p-5 shadow-[0_4px_16px_rgba(16,34,23,.05)] md:p-6"><div className="flex items-center justify-between"><div className="flex rounded-xl bg-[#eef5e8] p-1"><button className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1d4a14] shadow-sm transition hover:bg-[#f7faf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">Minhas Ofertas</button><button className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-[#708077] transition hover:bg-white hover:text-[#1d4a14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">Negociações</button></div><a className="text-xs font-bold text-[#2f681f] transition hover:text-[#194e16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" href="#ofertas">Ver todas →</a></div><div className="mt-3 space-y-3"><Offer image={cafeImage} title="Café Arábica Especial" detail="320 sacas • Bebida dura • Disponível até 25 out." price="R$ 1.280,00" status="Ativa" /><Offer image={milhoImage} title="Milho Safrinha Seco" detail="480 sacas • Tipo 1 • 2 propostas recebidas" price="R$ 66,50" status="Em negociação" /></div></div>
          <aside id="negociacoes" className="rounded-2xl bg-[#1d4a14] p-6 text-white shadow-[0_4px_16px_rgba(16,34,23,.05)]"><h2 className="font-['Bricolage_Grotesque'] text-xl font-extrabold">Você tem 2 propostas novas</h2><p className="mt-3 text-sm leading-5 text-white/70">A mais recente é da Cooperativa Cerrado para seu lote de café.</p><div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4"><p className="text-xs font-bold text-[#bceb45]">Cooperativa Cerrado</p><strong className="mt-1 block text-2xl">R$ 1.245,00/saca</strong><p className="mt-1 text-[11px] text-white/60">Responder até amanhã, 18h</p></div><button className="mt-3 w-full cursor-pointer rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#102217] transition hover:bg-[#e3f3e8] active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">Analisar proposta</button></aside>
        </section>
      </main>
    </div>
  )
}

function Offer({ image, title, detail, price, status }: { image: string; title: string; detail: string; price: string; status: string }) {
  return <article className="flex items-center gap-4 rounded-xl bg-[#fafbf8] p-3.5"><img src={image} alt="" className="size-16 shrink-0 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-extrabold">{title}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'Ativa' ? 'bg-[#e3f3e8] text-[#287a48]' : 'bg-[#fff3d9] text-[#a56717]'}`}>{status}</span></div><p className="mt-1 text-xs text-[#708077]">{detail}</p></div><div className="text-right"><strong className="text-base font-extrabold">{price}</strong><span className="block text-[11px] text-[#708077]">por saca</span></div></article>
}
