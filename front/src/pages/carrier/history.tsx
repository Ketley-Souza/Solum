
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { ChevronDown, ChevronRight, CheckCircle2, Download, RefreshCw, Search, SlidersHorizontal } from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import type { Freight } from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectCompletedFreights, selectFreightsError, selectFreightsLoading,
  selectVehicles, useFreightStore,
} from "../../stores/freightStore";

const links = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];
const PAGE_SIZE = 10;
const money = (v: Freight["valor_frete"]) => v == null ? "A confirmar" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const number = (v: string | number) => Number(v).toLocaleString("pt-BR");
const date = (v: string) => new Date(v).toLocaleDateString("pt-BR");
const daysAgo = (days: number) => Date.now() - days * 86_400_000;
const csvCell = (value: string) => {
  // Impede que texto vindo da API seja interpretado como fórmula no Excel.
  const safe = /^[=+@\-]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
};

export default function CarrierHistoryPage() {
  const user = useAuthStore((s) => s.user);
  const freightsSelector = useMemo(() => selectCompletedFreights(user?.id), [user?.id]);
  const freights = useFreightStore(useShallow(freightsSelector));
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);
  const storeError = useFreightStore(selectFreightsError);
  const fetchFreights = useFreightStore((s) => s.fetchFreights);
  const fetchVehicles = useFreightStore((s) => s.fetchVehicles);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todos");
  const [range, setRange] = useState("90");
  const [order, setOrder] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const load = () => Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  useEffect(() => { void Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]); }, [fetchFreights, fetchVehicles, user?.id]);
  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    const cutoff = range === "all" ? 0 : daysAgo(Number(range));
    return freights.filter((f) => {
      const text = [f.codigo, f.endereco_origem, f.endereco_destino, f.pedido?.codigo, f.pedido?.oferta?.produto, f.pedido?.oferta?.categoria].join(" ").toLocaleLowerCase("pt-BR");
      const sameMonth = (() => { const d = new Date(f.atualizado_em); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })();
      const matchesTab = tab === "Todos" || (tab === "Este mês" && sameMonth) || (tab === "Com valor" && f.valor_frete != null) || (tab === "A confirmar" && f.valor_frete == null);
      return text.includes(term) && matchesTab && new Date(f.atualizado_em).getTime() >= cutoff;
    }).sort((a, b) => (new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()) * (order === "recent" ? 1 : -1));
  }, [freights, search, tab, range, order]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function resetPage() { setPage(1); setDetailsId(null); }
  function exportCsv() {
    const rows = [
      ["Código", "Pedido", "Produto", "Origem", "Destino", "Peso (t)", "Valor do frete", "Última atualização", "Status"],
      ...filtered.map((f) => [f.codigo, f.pedido?.codigo || f.pedido_id, f.pedido?.oferta?.produto || "", f.endereco_origem, f.endereco_destino, String(f.peso_toneladas), f.valor_frete == null ? "A confirmar" : String(f.valor_frete), date(f.atualizado_em), "ENTREGUE"]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "historico-fretes-transportador.csv"; a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#142418]">
      <ProfileNavbar profileName={user?.name || "Transportador"} role="TRANSPORTADOR" links={links} notificationsHref="/transportador/notificacoes" />
      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-[#2e7839]">Área do transportador</p><h1 className="mt-1 font-['Bricolage_Grotesque'] text-[30px] font-extrabold tracking-tight md:text-[32px]">Histórico</h1><p className="mt-1 text-xs text-[#829084]">Consulte os fretes concluídos e entregas anteriores.</p></div>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-5 py-3 text-xs font-bold hover:bg-[#f0f6ec]"><Download size={16}/> Exportar</button>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#eff5ea] p-1" role="group" aria-label="Tipo de registro">
            {["Todos", "Este mês", "Com valor", "A confirmar"].map((name) => <button key={name} type="button" aria-pressed={tab === name} onClick={() => { setTab(name); resetPage(); }} className={`rounded-lg px-4 py-2 text-[11px] font-bold ${tab === name ? "bg-white text-[#29542b] shadow-sm" : "text-[#728270] hover:text-[#2a612c]"}`}>{name}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2.5"><Search size={15} className="text-[#7e9581]"/><input value={search} onChange={(e) => { setSearch(e.target.value); resetPage(); }} className="w-[185px] bg-transparent text-[11px] outline-none sm:w-[220px]" placeholder="Buscar carga, destino ou código" aria-label="Buscar no histórico" /></label>
            <label className="relative flex items-center rounded-xl border border-[#dfe6da] bg-white"><select aria-label="Período" value={range} onChange={(e) => { setRange(e.target.value); resetPage(); }} className="appearance-none bg-transparent py-2.5 pl-3 pr-8 text-[11px] outline-none"><option value="30">Últimos 30 dias</option><option value="90">Últimos 90 dias</option><option value="365">Últimos 365 dias</option><option value="all">Todo o período</option></select><ChevronDown size={14} className="pointer-events-none absolute right-2 text-[#60715e]"/></label>
            <button type="button" onClick={() => setShowFilters((v) => !v)} aria-expanded={showFilters} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2.5 text-[11px] font-bold hover:bg-[#f0f6ec]"><SlidersHorizontal size={14}/> Filtros</button>
          </div>
        </div>
        {showFilters && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8dd] bg-white p-3"><label className="text-xs text-[#637463]">Ordenar por: <select value={order} onChange={(e) => { setOrder(e.target.value); resetPage(); }} className="ml-2 rounded-lg border border-[#dfe6da] p-2 text-xs"><option value="recent">Mais recentes</option><option value="old">Mais antigos</option></select></label><button type="button" onClick={() => void load()} className="inline-flex items-center gap-1 text-xs font-bold text-[#316a2d]"><RefreshCw size={14}/> Atualizar lista</button></div>}
        {storeError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-800">{storeError}</p>}
        <p className="mt-3 text-[11px] text-[#849184]" role="status">{filtered.length} resultado(s) encontrado(s) · {freights.length} entrega(s) no histórico. As datas representam a última atualização dos registros.</p>

        <section className="mt-3 overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-[0_4px_15px_rgba(24,48,28,0.045)]" aria-label="Histórico de entregas">
          {loading && freights.length === 0 ? <p className="p-8 text-center text-xs text-[#849184]">Carregando histórico...</p> : paged.length === 0 ? <div className="p-9 text-center"><CheckCircle2 size={27} className="mx-auto text-[#85a77e]"/><p className="mt-3 text-sm font-bold">Nenhuma entrega encontrada</p><p className="mt-1 text-xs text-[#849184]">Tente ajustar a pesquisa ou o período.</p></div> : paged.map((f, index) => {
            const vehicle = vehicles.find((v) => v.id === f.veiculo_id);
            const open = detailsId === f.id;
            return <article key={f.id} className={index ? "border-t border-[#e4eae1]" : ""}>
              <button type="button" onClick={() => setDetailsId(open ? null : f.id)} aria-expanded={open} className="flex w-full flex-col gap-3 px-4 py-4 text-left hover:bg-[#fbfdf9] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf5e6] text-[#3b7a29]"><CheckCircle2 size={18}/></span><div className="min-w-0"><p className="truncate text-xs font-extrabold sm:text-sm">{f.pedido?.oferta?.produto || "Carga agrícola"} · {f.codigo}</p><p className="mt-1 truncate text-[10px] text-[#839081]">{f.endereco_origem} → {f.endereco_destino} · {number(f.peso_toneladas)} ton</p></div></div>
                <div className="flex shrink-0 items-center gap-3 pl-[52px] sm:gap-6 sm:pl-0"><div className="min-w-[85px]"><p className="text-[9px] uppercase text-[#849183]">Data</p><p className="mt-1 text-[11px] text-[#40513d]">{date(f.atualizado_em)}</p></div><div className="min-w-[95px]"><p className="text-[9px] uppercase text-[#849183]">Valor do frete</p><p className="mt-1 text-[11px] font-semibold text-[#40513d]">{money(f.valor_frete)}</p></div><span className="rounded-full bg-[#e3f3e6] px-3 py-1 text-[10px] font-bold text-[#388653]">Entregue</span><ChevronRight size={17} className={`shrink-0 text-[#718674] transition ${open ? "rotate-90" : ""}`}/></div>
              </button>
              {open && <div className="grid gap-3 border-t border-[#ecf0e9] bg-[#fafcf7] px-5 py-4 text-xs sm:grid-cols-2"><p><b>Pedido:</b> {f.pedido?.codigo || f.pedido_id}</p><p><b>Categoria:</b> {f.pedido?.oferta?.categoria || "Não informada"}</p><p><b>Origem completa:</b> {f.endereco_origem}</p><p><b>Destino completo:</b> {f.endereco_destino}</p><p><b>Peso:</b> {number(f.peso_toneladas)} toneladas</p><p><b>Veículo:</b> {vehicle ? `${vehicle.tipo_veiculo} (${number(vehicle.capacidade_toneladas)} t)` : f.veiculo_id || "Não informado"}</p><p><b>Cadastrado em:</b> {new Date(f.criado_em).toLocaleString("pt-BR")}</p><p><b>Última atualização:</b> {new Date(f.atualizado_em).toLocaleString("pt-BR")}</p>{f.valor_frete == null && <p className="sm:col-span-2 text-[#98672a]">Valor não informado no cadastro; isso não indica ausência ou confirmação de pagamento.</p>}<p className="sm:col-span-2 text-[10px] text-[#7b8b79]">O sistema ainda não fornece comprovante nem uma data separada de conclusão de entrega.</p></div>}
            </article>;
          })}
        </section>
        {filtered.length > PAGE_SIZE && <nav className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-label="Paginação do histórico"><p className="text-xs text-[#819080]">Exibindo {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length} fretes</p><div className="flex items-center gap-3"><button disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); setDetailsId(null); }} className="rounded-xl border border-[#dfe6da] bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">Anterior</button><span className="text-xs">Página {currentPage} de {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); setDetailsId(null); }} className="rounded-xl border border-[#dfe6da] bg-white px-4 py-2 text-xs font-bold disabled:opacity-40">Próxima</button></div></nav>}
      </main>
    </div>
  );
}