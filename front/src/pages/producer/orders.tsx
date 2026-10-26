import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, Building2, CheckCircle2, Clock3,
  MapPin, Package, Search, ShieldCheck, Truck,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import { orderService, type BackendOrder, type OrderStatus } from "../../services/orderService";

type Stage = "Negociando" | "Fechado" | "Em transporte" | "Entregue";
type Order = {
  id: string;
  product: string;
  buyer: string;
  quantity: number;
  weightTons: number;
  price: number;
  stage: Stage;
  origin: string;
  farm: string;
  destination: string;
  deliveryPoint: string;
  carrier?: string;
  driver?: string;
  vehicle?: string;
  lastUpdate: string;
};

const STAGE_BY_STATUS: Record<OrderStatus, Stage> = {
  ABERTO: "Negociando",
  NEGOCIANDO: "Negociando",
  FECHADO: "Fechado",
  EM_TRANSPORTE: "Em transporte",
  ENTREGUE: "Entregue",
};
function toOrder(pedido: BackendOrder): Order {
  return {
    id: pedido.codigo,
    product: pedido.oferta.produto,
    buyer: pedido.comprador?.nome ?? "—",
    quantity: Number(pedido.quantidade_final),
    weightTons: Number(pedido.frete?.peso_toneladas ?? 0),
    price: Number(pedido.preco_final) * Number(pedido.quantidade_final),
    stage: STAGE_BY_STATUS[pedido.status],
    origin: pedido.oferta.localizacao,
    farm: pedido.oferta.produtor?.nome ?? "",
    destination: pedido.endereco_entrega,
    deliveryPoint: "Endereço de entrega",
    lastUpdate: new Date(pedido.atualizado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
  };
}

const links = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];
const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const stageColors: Record<Stage, string> = {
  Negociando: "bg-[#fff0d7] text-[#a6680a]",
  Fechado: "bg-[#e3f5e9] text-[#23804b]",
  "Em transporte": "bg-[#e5f2f7] text-[#35738d]",
  Entregue: "bg-[#e6f4e8] text-[#23804b]",
};
const phases = ["Aberto", "Negociando", "Fechado", "Em transporte", "Entregue"];
function stageIndex(stage: Stage) {
  return stage === "Negociando" ? 1 : stage === "Fechado" ? 2 : stage === "Em transporte" ? 3 : 4;
}

export default function ProducerOrdersPage() {
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"Todas" | "Em andamento" | "Concluídos">("Todas");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    orderService.list().then((pedidos) => setOrders(pedidos.map(toOrder))).catch(() => setOrders([]));
  }, []);
  const underway = orders.filter((order) => order.stage !== "Entregue").length;
  const completed = orders.filter((order) => order.stage === "Entregue").length;
  const visible = useMemo(() => orders.filter((order) => {
    const matchesFilter = filter === "Todas" || (filter === "Em andamento" ? order.stage !== "Entregue" : order.stage === "Entregue");
    const matchesSearch = `${order.id} ${order.product} ${order.buyer}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"));
    return matchesFilter && matchesSearch;
  }), [orders, filter, search]);

  function changeFilter(next: typeof filter) {
    setFilter(next);
    setSearch("");
    const first = orders.find((o) => next === "Todas" || (next === "Em andamento" ? o.stage !== "Entregue" : o.stage === "Entregue"));
    if (first) setSelectedId(first.id);
  }
  const currentSelection = visible.find((o) => o.id === selectedId) ?? visible[0] ?? null;
  const display = currentSelection;

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName="João Ribeiro"
        role="PRODUTOR"
        links={links}
        notificationCount={2}
        notificationsHref="/produtor/notificacoes"
      />
      <main className="mx-auto max-w-7xl px-5 py-7 md:px-10">
        <p className="mb-1 text-xs font-bold uppercase text-[#2d6922]">Área do produtor</p>
        <h1 className="text-3xl font-extrabold tracking-tight">Pedidos e logística</h1>
        <p className="mt-2 text-sm text-[#78877d]">Acompanhe cada venda do fechamento à confirmação da entrega.</p>

        <div className="my-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#edf3e9] p-1">
            {([ ["Todas", orders.length], ["Em andamento", underway], ["Concluídos", completed] ] as const).map(([title, total]) => (
              <button type="button" key={title} onClick={() => changeFilter(title)} className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${filter === title ? "bg-white text-[#1d4818] shadow-sm" : "text-[#748579] hover:text-[#1d4818]"}`}>{title} {total}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {showSearch && <label className="flex items-center gap-2 rounded-lg border border-[#dce4d9] bg-white px-3 py-2"><Search size={15}/><input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} className="w-44 bg-transparent text-sm outline-none" placeholder="Produto, comprador ou pedido" /></label>}
            <button type="button" onClick={() => { setShowSearch((old) => !old); setSearch(""); }} aria-label="Pesquisar pedidos" className="rounded-lg border border-[#dce4d9] bg-white p-2.5 text-[#5b7760]"><Search size={16}/></button>
            <span className="text-xs text-[#87938a]">{orders.length} no total</span>
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-2xl border border-[#dfe5dc] bg-white shadow-sm" aria-label="Pedidos recentes">
            <div className="flex justify-between border-b border-[#e5e9e3] p-4"><h2 className="text-sm font-extrabold">Pedidos recentes</h2><span className="text-xs text-[#87938a]">{visible.length} pedidos</span></div>
            {visible.length === 0 ? <p className="p-5 text-sm text-[#78877d]">Nenhum pedido encontrado.</p> : visible.map((order) => (
              <button type="button" key={order.id} onClick={() => setSelectedId(order.id)} aria-pressed={display?.id === order.id} className={`w-full border-b border-[#e5e9e3] p-4 text-left transition last:border-0 hover:bg-[#f6f9f3] ${display?.id === order.id ? "border-l-2 border-l-[#2d6922] bg-[#f0f5eb]" : ""}`}>
                <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[11px] font-extrabold text-[#2d6922]">{order.id}</span><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${stageColors[order.stage]}`}>{order.stage}</span></div>
                <h3 className="mt-2 text-sm font-extrabold">{order.product}</h3>
                <p className="mt-1 text-xs text-[#78877d]">{order.buyer} · {order.quantity} sacas</p>
                <p className="mt-2 text-xs font-bold">{order.stage === "Negociando" ? "Em negociação" : currency(order.price)}</p>
              </button>
            ))}
          </section>

          {display && <div className="min-w-0 space-y-3">
            <section className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-extrabold uppercase text-[#2d6922]">Pedido {display.id}</p><h2 className="mt-1 text-lg font-extrabold">{display.product} · {display.quantity} sacas</h2></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${stageColors[display.stage]}`}>{display.stage}</span></div>
              <ol className="mt-6 grid grid-cols-5 gap-1" aria-label="Etapas do pedido">
                {phases.map((phase, i) => {
                  const reached = i <= stageIndex(display.stage);
                  return <li key={phase} className="min-w-0 text-center"><div className="flex items-center gap-1"><span className={`h-1 flex-1 rounded-full ${reached ? "bg-[#2d6922]" : "bg-[#e5e9e3]"}`}/><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${reached ? "bg-[#2d6922] text-white" : "bg-[#edf1e9] text-[#6e8172]"}`}>{reached ? <CheckCircle2 size={14}/> : i+1}</span><span className={`h-1 flex-1 rounded-full ${i < stageIndex(display.stage) ? "bg-[#2d6922]" : "bg-[#e5e9e3]"}`}/></div><span className={`mt-2 block text-[10px] leading-tight ${reached ? "font-bold text-[#1d4818]" : "text-[#85958a]"}`}>{phase}</span></li>;
                })}
              </ol>
            </section>

            <div className="grid gap-3 md:grid-cols-2">
              <section className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold"><Building2 size={17} className="text-[#2d6922]"/> Comprador e carga</h3>
                <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="mb-1 text-[10px] uppercase text-[#87938a]">Comprador</p><strong className="text-xs">{display.buyer}</strong></div><div><p className="mb-1 text-[10px] uppercase text-[#87938a]">Pedido</p><strong className="text-xs">{display.id}</strong></div><div><p className="mb-1 text-[10px] uppercase text-[#87938a]">Carga</p><strong className="text-xs">{display.quantity} sacas · {display.weightTons.toLocaleString("pt-BR")} t</strong></div><div><p className="mb-1 text-[10px] uppercase text-[#87938a]">Valor</p><strong className="text-xs">{display.stage === "Negociando" ? "Em negociação" : currency(display.price)}</strong></div></div>
              </section>
              <section className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold"><span className="flex items-center gap-2"><Truck size={17} className="text-[#2d6922]"/> Transportador</span><span className={`rounded-full px-2 py-1 text-[10px] ${display.carrier ? "bg-[#e3f5e9] text-[#23804b]" : "bg-[#edf1e9] text-[#65766a]"}`}>{display.carrier ? "Atribuído" : "Não definido"}</span></h3>
                {display.carrier ? <div className="space-y-3 text-xs"><p><span className="block text-[10px] uppercase text-[#87938a]">Empresa</span><strong>{display.carrier}</strong></p><div className="grid grid-cols-2 gap-2"><p><span className="block text-[10px] uppercase text-[#87938a]">Motorista</span><strong>{display.driver}</strong></p><p><span className="block text-[10px] uppercase text-[#87938a]">Veículo</span><strong>{display.vehicle}</strong></p></div></div> : <div className="flex items-start gap-2 rounded-lg bg-[#f7f8f3] p-3 text-xs text-[#66776b]"><Clock3 size={16} className="shrink-0"/> Atribuição de frete ainda não registrada. A solicitação real será gerada pelo back-end após o fechamento da venda.</div>}
              </section>
            </div>

            <section className="rounded-2xl border border-[#dfe5dc] bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold"><MapPin size={17} className="text-[#2d6922]"/> Rota planejada</h3>
              <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]"><div className="rounded-xl bg-[#f0f5eb] p-4"><p className="text-[10px] font-extrabold uppercase text-[#2d6922]">Origem</p><strong className="mt-1 block text-sm">{display.origin}</strong><p className="mt-1 text-xs text-[#78877d]">{display.farm}</p></div><ArrowRight size={18} className="mx-auto rotate-90 text-[#2d6922] md:rotate-0"/><div className="rounded-xl bg-[#f0f5eb] p-4"><p className="text-[10px] font-extrabold uppercase text-[#2d6922]">Destino</p><strong className="mt-1 block text-sm">{display.destination}</strong><p className="mt-1 text-xs text-[#78877d]">{display.deliveryPoint}</p></div></div>
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-[#f0f5eb] p-3 text-xs text-[#66776b]"><ShieldCheck size={16} className="shrink-0 text-[#2d6922]"/> CPF/CNPJ e endereço completo ficam protegidos e são exibidos apenas conforme a autorização da negociação.</p>
            </section>
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#87938a]"><span className="flex items-center gap-2"><Package size={14}/> Dados do banco de dados</span><span className="flex items-center gap-2"><Bell size={14}/> Atualizado: {display.lastUpdate}</span></div>
          </div>}
        </div>
      </main>
    </div>
  );
}
