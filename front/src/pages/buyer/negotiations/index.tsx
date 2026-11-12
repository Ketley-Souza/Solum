import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileNavbar from '../../../components/ProfileNavbar'
import { proposalService, type BackendProposal } from '../../../services/proposalService'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const parsePrice = (value: string) => Number(value.replace(/\./g, '').replace(',', '.'))

export default function BuyerNegotiationsPage() {
  const [proposals, setProposals] = useState<BackendProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    try {
      setProposals(await proposalService.list())
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as negociações.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName="João Ribeiro"
        role="COMPRADOR"
        notificationCount={3}
        notificationsHref="/comprador/notificacoes"
        links={[
          { label: 'Marketplace', href: '/comprador' },
          { label: 'Negociações', href: '/comprador/negociacoes' },
          { label: 'Meus pedidos', href: '/comprador/pedidos' },
        ]}
      />
      <main className="mx-auto max-w-[1100px] px-5 pb-16 pt-9 md:px-12">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#287a48]">Conta compradora · Negociação</p>
        <h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">Minhas negociações</h1>
        <p className="mt-2 text-sm text-[#708077]">Responda propostas e contrapropostas aqui. Os pedidos ficam somente para acompanhamento.</p>

        {loading && <p className="mt-8 text-sm text-[#708077]">Carregando negociações...</p>}
        {error && <p role="alert" className="mt-8 rounded-xl bg-[#fff0d8] p-4 text-sm text-[#8a5c13]">{error}</p>}
        {!loading && !error && proposals.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#e0e6dd] bg-white p-8 text-center text-sm text-[#708077]">
            Você ainda não possui negociações.
            <Link to="/comprador" className="ml-1 font-bold text-[#2d6922]">Explorar ofertas</Link>
          </div>
        )}
        <div className="mt-7 space-y-4">
          {proposals.map((proposal) => <NegotiationCard key={proposal.id} proposal={proposal} onUpdated={load} />)}
        </div>
      </main>
    </div>
  )
}

function NegotiationCard({ proposal, onUpdated }: { proposal: BackendProposal; onUpdated: () => Promise<void> }) {
  const counter = proposal.contrapropostas[0]
  const canAnswer = counter?.status === 'PENDENTE'
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
      await onUpdated()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar a negociação.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl border border-[#e0e6dd] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#287a48]">Negociação {proposal.id}</p>
          <h2 className="mt-1 text-lg font-extrabold">{proposal.oferta.produto} · {Number(proposal.quantidade)} {proposal.oferta.unidade}</h2>
          <p className="mt-1 text-xs text-[#708077]">Proposta do comprador: {brl(Number(proposal.preco))} por unidade</p>
        </div>
        <span className="rounded-full bg-[#fff0d8] px-3 py-1.5 text-[10px] font-extrabold text-[#ad6a15]">{proposal.status}</span>
      </div>
      {counter && <div className="mt-5 rounded-xl bg-[#f7f8f3] p-4 text-sm">
        <p className="font-bold">Contraproposta do produtor</p>
        <p className="mt-1">{brl(Number(counter.preco_contraproposta))} por unidade</p>
        {counter.mensagem && <p className="mt-2 text-xs text-[#708077]">{counter.mensagem}</p>}
      </div>}
      {canAnswer && <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Nova oferta (ex.: 1250,00)" className="rounded-lg border border-[#dce4d9] px-3 py-2 text-sm outline-none focus:border-[#2d6922]" />
        <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mensagem (opcional)" className="rounded-lg border border-[#dce4d9] px-3 py-2 text-sm outline-none focus:border-[#2d6922]" />
        <button disabled={busy || !price || !Number.isFinite(parsePrice(price)) || parsePrice(price) <= 0} onClick={() => run(() => proposalService.counter(proposal.id, { preco: parsePrice(price), quantidade: Number(proposal.quantidade), mensagem: message || undefined }))} className="rounded-lg bg-[#2d6922] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Enviar contraproposta</button>
      </div>}
      {canAnswer && <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => run(() => proposalService.acceptCounter(counter.id))} className="rounded-lg bg-[#c1f23c] px-4 py-2 text-xs font-bold text-[#173b21]">Aceitar contraproposta</button>
        <button disabled={busy} onClick={() => run(() => proposalService.rejectCounter(counter.id))} className="rounded-lg border border-[#e0e6dd] px-4 py-2 text-xs font-bold text-[#a94843]">Recusar</button>
      </div>}
      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
    </article>
  )
}
