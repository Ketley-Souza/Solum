import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Clock3, Handshake, Search, Send, SlidersHorizontal, X } from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import { notificationService } from "../../services/notificationService";
import { useAuthStore } from "../../stores/authStore";
import { proposalService, type BackendProposal } from "../../services/proposalService";

type Status = "Pendente" | "Ativa" | "Concluída" | "Recusada" | "Cancelada";
type Action = "accept" | "counter" | "reject";
type Negotiation = {
  id: string;
  product: string;
  quantity: number;
  buyer: string;
  destination: string | null;
  unit: string;
  originalPrice: number;
  proposedPrice: number;
  status: Status;
  activity: string;
  received: string;
  deadline: string;
  payment: string;
  collection: string;
  messages: { text: string; date: string }[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function toNegotiation(proposal: BackendProposal): Negotiation {
  const counter = proposal.status === "PENDENTE" ? undefined : proposal.contrapropostas[0];
  const order = proposal.pedido as (NonNullable<BackendProposal["pedido"]> & { endereco_entrega?: string }) | null | undefined;
  const status: Record<BackendProposal["status"], Status> = {
    PENDENTE: "Pendente",
    CONTRAPROPOSTA: "Ativa",
    ACEITA: "Concluída",
    RECUSADA: "Recusada",
  };
  return {
    id: proposal.id,
    product: proposal.oferta.produto,
    quantity: Number(counter?.quantidade_contraproposta ?? proposal.quantidade),
    buyer: proposal.comprador.nome,
    destination: order?.endereco_entrega || null,
    unit: proposal.oferta.unidade,
    originalPrice: Number(proposal.oferta.preco),
    proposedPrice: Number(counter?.preco_contraproposta ?? proposal.preco),
    status: status[proposal.status],
    activity: formatDate(proposal.atualizado_em),
    received: formatDate(proposal.criado_em),
    deadline: counter && counter.status === "PENDENTE" ? formatDate(counter.expira_em) : "Não informado pela API",
    payment: "A definir",
    collection: proposal.pedido ? "Pedido criado" : "A definir",
    messages: [
      { text: `Proposta recebida: ${currency(Number(proposal.preco))} — ${proposal.quantidade} ${proposal.oferta.unidade}`, date: formatDate(proposal.criado_em) },
      ...[...proposal.contrapropostas].reverse().map((c) => ({ text: `Contraproposta: ${currency(Number(c.preco_contraproposta))} — ${c.quantidade_contraproposta} ${proposal.oferta.unidade} (${c.status})${c.mensagem ? ` • ${c.mensagem}` : ""}`, date: formatDate(c.criado_em) })),
      ...(proposal.status === "ACEITA" ? [{ text: "Proposta aceita", date: formatDate(proposal.atualizado_em) }] : []),
      ...(proposal.status === "RECUSADA" ? [{ text: "Proposta recusada", date: formatDate(proposal.atualizado_em) }] : []),
    ],
  };
}
const nav = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];
const currency = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const colors: Record<Status, string> = {
  Pendente: "bg-[#fff0d7] text-[#a6680a]", Ativa: "bg-[#e5f2f7] text-[#35738d]", Concluída: "bg-[#e3f5e9] text-[#23804b]", Recusada: "bg-[#fde8e7] text-[#bf4440]", Cancelada: "bg-[#edf1e9] text-[#526650]",
};
const input = "w-full rounded-xl border border-[#dfe5dc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#2d6922] focus:ring-2 focus:ring-green-100";

export default function ProducerNegotiationsPage() {
  const profileName = useAuthStore((state) => state.user?.name ?? "Produtor");
  const [notificationCount, setNotificationCount] = useState<number | undefined>(undefined);
  const [notificationError, setNotificationError] = useState(false);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try { const items = await notificationService.list(); if (alive) setNotificationCount(items.filter((item) => !item.lida).length); }
      catch { if (alive) setNotificationError(true); }
    })();
    return () => { alive = false; };
  }, []);
  const [items, setItems] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);
  const [counter, setCounter] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("Preço abaixo do esperado");
  const [error, setError] = useState("");
  const [withAttention, setWithAttention] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const detailRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<string | null>(null);
  useEffect(() => {
    if (selected) detailRef.current?.focus();
    else if (returnFocus.current) document.getElementById(returnFocus.current)?.focus();
  }, [selected]);
  useEffect(() => {
    if (!action) return;
    const dialog = dialogRef.current;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => { dialog?.close(); document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus(); };
  }, [action]);

  async function loadNegotiations() {
    setLoading(true);
    setLoadError("");
    try {
      const proposals = await proposalService.list();
      setItems(proposals.map(toNegotiation));
    } catch (loadFailure) {
      setLoadError(loadFailure instanceof Error ? loadFailure.message : "Não foi possível carregar as negociações.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNegotiations();
  }, []);

  const active = items.find((item) => item.id === selected) ?? null;
  const canRespond = active?.status === "Pendente";
  const tabs = [
    { label: "Todas", count: items.length },
    { label: "Pendentes", count: items.filter((n) => n.status === "Pendente").length },
    { label: "Ativas", count: items.filter((n) => n.status === "Ativa").length },
    { label: "Concluídas", count: items.filter((n) => n.status === "Concluída").length },
    { label: "Recusadas", count: items.filter((n) => n.status === "Recusada").length },
    { label: "Canceladas", count: items.filter((n) => n.status === "Cancelada").length },
  ];
  const visible = useMemo(() => items.filter((n) => {
    const matchText = `${n.product} ${n.buyer} ${n.id}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"));
    const matchFilter = filter === "Todas" || n.status === ({ Pendentes: "Pendente", Ativas: "Ativa", "Concluídas": "Concluída", "Recusadas": "Recusada", "Canceladas": "Cancelada" } as Record<string, string>)[filter];
    return matchText && matchFilter && (!withAttention || n.status === "Pendente");
  }), [items, filter, search, withAttention]);

  function openAction(next: Action) {
    if (!active || !canRespond) return;
    setError(""); setCounter(""); setMessage(""); setReason("Preço abaixo do esperado"); setAction(next);
  }
  async function applyAction() {
    if (!active || !action || !canRespond) return;
    try {
      if (action === "accept") {
        await proposalService.accept(active.id);
      } else if (action === "reject") {
        await proposalService.reject(active.id);
      } else {
      const amount = Number(counter.replace(",", "."));
      if (!Number.isFinite(amount) || amount <= 0 || amount < Math.min(active.proposedPrice, active.originalPrice) || amount > Math.max(active.proposedPrice, active.originalPrice)) {
        setError(`Informe um preço positivo entre ${currency(Math.min(active.proposedPrice, active.originalPrice))} e ${currency(Math.max(active.proposedPrice, active.originalPrice))}.`);
        return;
      }
        await proposalService.counter(active.id, {
          preco: amount,
          quantidade: active.quantity,
          mensagem: message.trim() || undefined,
        });
      }
      await loadNegotiations();
      setSelected(null);
      setAction(null);
    } catch (actionFailure) {
      setError(actionFailure instanceof Error ? actionFailure.message : "Não foi possível atualizar a negociação.");
    }
  }

  return <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
    <ProfileNavbar
      profileName={profileName}
      role="PRODUTOR"
      links={nav}
      notificationCount={notificationCount}
      notificationsHref="/produtor/notificacoes"
    />
    {notificationError && <p role="status" className="mx-auto max-w-7xl px-5 pt-3 text-xs text-red-700">Contador de notificações indisponível.</p>}
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
      {!active ? <>
        <h1 className="text-3xl font-extrabold tracking-tight">Negociações</h1>
        <p className="mt-2 text-sm text-[#78877d]">Analise propostas e acompanhe cada acordo até a conclusão.</p>
        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#edf3e9] p-1">{tabs.map((tab) => <button key={tab.label} onClick={() => { setFilter(tab.label); setWithAttention(false); setFilterOpen(false); }} className={`rounded-lg px-4 py-2 text-xs font-semibold ${filter === tab.label ? "bg-white text-[#1d4818] shadow-sm" : "text-[#748579]"}`}>{tab.label} {tab.count}</button>)}</div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#dce4d9] bg-white px-3 py-2"><Search size={16} className="text-[#78877d]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar comprador ou produto" className="w-44 bg-transparent text-sm outline-none md:w-52"/></label>
            <div className="relative">
              <button type="button" aria-expanded={filterOpen} aria-controls="producer-negotiation-filters" onClick={() => setFilterOpen((v) => !v)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${filterOpen || withAttention ? "border-[#2d6922] bg-[#e3f5e9]" : "border-[#dce4d9] bg-white"}`}><SlidersHorizontal size={15}/> Filtros{withAttention ? " (1)" : ""}</button>
              {filterOpen && <div id="producer-negotiation-filters" className="absolute right-0 top-12 z-30 w-64 rounded-xl border border-[#dfe5dc] bg-white p-4 shadow-xl">
                <p className="mb-3 text-sm font-bold">Filtrar negociações</p>
                <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" checked={withAttention} onChange={(e) => setWithAttention(e.target.checked)} className="accent-[#2d6922]"/> Apenas pendentes de resposta</label>
                <div className="mt-4 flex justify-between gap-2"><button type="button" onClick={() => { setWithAttention(false); setFilter("Todas"); setSearch(""); }} className="rounded-lg border border-[#dfe5dc] px-3 py-2 text-xs font-semibold">Limpar filtros</button><button type="button" onClick={() => setFilterOpen(false)} className="rounded-lg bg-[#2d6922] px-3 py-2 text-xs font-semibold text-white">Concluir</button></div>
              </div>}
            </div>
          </div>
        </div>
        <section className="overflow-hidden rounded-2xl border border-[#dfe5dc] bg-white shadow-sm">
          <div className="flex justify-between border-b border-[#e5e9e3] px-5 py-5 text-xs"><strong>{visible.length} negociações</strong><span className="text-[#87938a]">Mais recentes</span></div>
          {loading ? <p className="p-12 text-center text-sm text-[#78877d]">Carregando negociações...</p> : loadError ? <p role="alert" className="p-12 text-center text-sm text-red-600">{loadError}</p> : visible.length === 0 ? <p className="p-12 text-center text-sm text-[#78877d]">Nenhuma negociação encontrada.</p> : visible.map((n) => <button key={n.id} type="button" id={`neg-${n.id}`} onClick={() => { returnFocus.current = `neg-${n.id}`; setSelected(n.id); }} className="flex w-full flex-wrap items-center gap-4 border-b border-[#e5e9e3] px-4 py-5 text-left last:border-b-0 hover:bg-[#fafbf8] md:flex-nowrap">
            <span className="rounded-xl bg-[#edf5e8] p-3 text-[#2d6922]"><Handshake size={19}/></span>
            <span className="min-w-0 flex-1"><strong className="block text-sm">{n.product} • {n.quantity} {n.unit}</strong><span className="mt-1 block text-xs text-[#87938a]">{n.id} • {n.buyer}</span></span>
            <span className="w-32"><span className="block text-[10px] text-[#87938a]">PROPOSTA</span><strong className="text-sm">{currency(n.proposedPrice)}/{n.unit}</strong></span>
            <span className="w-28"><span className="block text-[10px] text-[#87938a]">ÚLTIMA ATIVIDADE</span><span className="text-xs">{n.activity}</span></span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[n.status]}`}>{n.status}</span><ChevronRight size={17} className="text-[#78877d]"/>
          </button>)}
        </section>
      </> : <>
        <button ref={detailRef} onClick={() => setSelected(null)} className="mb-3 flex items-center gap-2 text-xs font-bold text-[#2d6922]"><ArrowLeft size={15}/> Voltar</button>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold text-[#2d6922]">NEGOCIAÇÃO {active.id}</p><h1 className="mt-1 text-3xl font-extrabold">Proposta para {active.product}</h1><p className="mt-2 text-sm text-[#78877d]">Recebida: {active.received} • Prazo: {active.deadline}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[active.status]}`}>{active.status}</span></div>
        <div className="mt-5 grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm"><div><strong className="block">{active.buyer}</strong><span className="text-xs text-[#78877d]">Comprador cadastrado{active.destination ? ` • Destino do pedido: ${active.destination}` : " • Localização não disponibilizada pela API"}</span></div><span className="rounded-full bg-[#e3f5e9] px-3 py-1 text-xs font-bold text-[#287a48]">Comprador cadastrado</span></div>
            <div className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm"><h2 className="mb-4 text-base font-extrabold">Proposta recebida</h2><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#dfe5dc] bg-[#fafbf8] p-4"><p className="text-xs text-[#78877d]">PREÇO ANUNCIADO</p><strong>{currency(active.originalPrice)}/{active.unit}</strong><p className="mt-3 text-xs text-[#78877d]">TOTAL</p><span>{currency(active.originalPrice * active.quantity)}</span></div><div className="rounded-xl bg-[#e8f4cc] p-4"><p className="text-xs text-[#557046]">PREÇO PROPOSTO</p><strong className="text-lg text-[#1d4818]">{currency(active.proposedPrice)}/{active.unit}</strong><p className="mt-3 text-xs text-[#557046]">TOTAL</p><span>{currency(active.proposedPrice * active.quantity)}</span></div></div>
              <div className="mt-3 flex justify-between rounded-xl bg-[#fff0d7] px-4 py-3 text-xs font-semibold text-[#a6680a]"><span>Diferença para o valor anunciado</span><span>{((active.proposedPrice / active.originalPrice - 1) * 100).toFixed(1).replace(".", ",")}% • {currency((active.proposedPrice - active.originalPrice) * active.quantity)}</span></div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs"><div><p className="text-[#78877d]">QUANTIDADE</p><strong>{active.quantity} {active.unit}</strong></div><div><p className="text-[#78877d]">PAGAMENTO</p><strong>{active.payment}</strong></div><div><p className="text-[#78877d]">RETIRADA SUGERIDA</p><strong>{active.collection}</strong></div></div></div>
            {canRespond && <div className="grid gap-2 sm:grid-cols-3"><button onClick={() => openAction("reject")} className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm font-semibold">Recusar</button><button onClick={() => openAction("counter")} className="rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm font-semibold">Fazer contraproposta</button><button onClick={() => openAction("accept")} className="rounded-xl bg-[#2d6922] px-4 py-3 text-sm font-semibold text-white">Aceitar proposta</button></div>}
          </div>
          <aside className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm"><h2 className="mb-5 text-lg font-extrabold">Histórico disponível na API</h2><div className="space-y-5">{active.messages.map((m, i) => <div key={`${i}-${m.text}`} className="flex items-start gap-3"><span className="rounded-full bg-[#edf5e8] p-1 text-[#2d6922]"><CheckCircle2 size={15}/></span><div><p className="text-xs font-semibold">{m.text}</p><p className="mt-1 text-[11px] text-[#78877d]">{m.date}</p></div></div>)}</div></aside>
        </div>
      </>}
    </main>
    {action && active && <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); setAction(null); }} aria-labelledby="action-title" aria-describedby="action-description" className="fixed inset-0 m-auto max-h-[94vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white text-[#102217] shadow-2xl backdrop:bg-[#102217]/70"><div className="flex items-start justify-between border-b border-[#e5e9e3] p-5"><div><h2 id="action-title" className={`text-xl font-extrabold ${action === "reject" ? "text-[#bf4440]" : ""}`}>{action === "accept" ? "Aceitar esta proposta?" : action === "reject" ? "Recusar proposta" : "Fazer contraproposta"}</h2><p id="action-description" className="mt-1 text-xs text-[#78877d]">{active.buyer} • {active.product}</p></div><button aria-label="Fechar" onClick={() => setAction(null)}><X size={18}/></button></div>
      <div className="space-y-4 p-5"><div className="rounded-xl bg-[#f7f8f3] p-4 text-sm"><p>Preço anunciado: <strong>{currency(active.originalPrice)}/{active.unit}</strong></p><p className="mt-2">Proposta recebida: <strong>{currency(active.proposedPrice)}/{active.unit}</strong></p><p className="mt-2">Quantidade: <strong>{active.quantity} {active.unit}</strong></p></div>
        {action === "accept" && <p className="rounded-xl bg-[#fff0d7] p-3 text-xs text-[#8a5c13]">Ao aceitar, a proposta será atualizada no banco e o pedido/frete serão criados pelo backend.</p>}
        {action === "counter" && <><label className="block text-xs font-semibold">Novo preço por {active.unit} (R$) *<input type="number" min={Math.min(active.proposedPrice, active.originalPrice)} max={Math.max(active.proposedPrice, active.originalPrice)} step="0.01" value={counter} onChange={(e) => {setCounter(e.target.value);setError("");}} placeholder="Ex.: 1270.00" className={`mt-2 ${input}`}/></label><p className="text-xs text-[#78877d]">Nesta interface, a contraproposta deve ficar entre o menor e o maior dos preços anunciado e recebido, para negociar dentro desse intervalo: {currency(Math.min(active.proposedPrice, active.originalPrice))} a {currency(Math.max(active.proposedPrice, active.originalPrice))}.</p><label className="block text-xs font-semibold">Mensagem ao comprador<textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`mt-2 ${input}`}/></label><p className="flex items-center gap-2 text-xs text-[#78877d]"><Clock3 size={14}/> A contraproposta será registrada no histórico da negociação.</p></>}
        {action === "reject" && <><label className="block text-xs font-semibold">Motivo *<select value={reason} onChange={(e) => setReason(e.target.value)} className={`mt-2 ${input}`}><option>Preço abaixo do esperado</option><option>Condições de pagamento</option><option>Prazo de retirada</option><option>Outro motivo</option></select></label><label className="block text-xs font-semibold">Observação ao comprador<textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={`mt-2 ${input}`}/></label></>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
      </div><div className="flex justify-end gap-2 border-t border-[#e5e9e3] p-4"><button onClick={() => setAction(null)} className="rounded-xl border border-[#dfe5dc] px-4 py-3 text-sm font-bold">Cancelar</button><button onClick={applyAction} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white ${action === "reject" ? "bg-[#bf4440]" : "bg-[#2d6922]"}`}>{action === "counter" ? <Send size={16}/> : <Check size={16}/>} {action === "accept" ? "Aceitar proposta" : action === "counter" ? "Enviar contraproposta" : "Confirmar recusa"}</button></div></dialog>}
  </div>;
}
