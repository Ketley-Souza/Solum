
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, Circle, MapPin, RefreshCw, Truck,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import type { Freight } from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectAllFreights, selectFreightsError, selectFreightsLoading,
  selectVehicles, useFreightStore,
} from "../../stores/freightStore";

const links = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];
const money = (v: Freight["valor_frete"]) => v == null ? "A confirmar" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const number = (v: string | number) => Number(v).toLocaleString("pt-BR");
const statusText = (status: Freight["status"]) => status === "ACEITO" ? "Aguardando início" : status === "EM_ROTA" ? "Em rota" : "Entregue";
const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR");

function Timeline({ status }: { status: Freight["status"] }) {
  const current = status === "ACEITO" ? 1 : status === "EM_ROTA" ? 3 : 4;
  const steps = ["Frete aceito", "Em coleta", "Em rota", "Entregue"];
  return (
    <div className="relative mt-8 grid grid-cols-4 gap-1 text-center" aria-label={`Progresso: ${statusText(status)}`}>
      <div aria-hidden="true" className="absolute left-[12%] right-[12%] top-[18px] h-[2px] bg-[#d5e2c8]" />
      <div aria-hidden="true" className="absolute left-[12%] top-[18px] h-[2px] bg-[#407e1d]" style={{ width: `${(current - 1) * 25}%` }} />
      {steps.map((step, i) => {
        const done = i + 1 < current;
        const now = i + 1 === current;
        return <div key={step} className="relative z-10 flex flex-col items-center gap-2">
          <span className={`grid h-9 w-9 place-items-center rounded-full border-2 ${done ? "border-[#3f831c] bg-[#3f831c] text-white" : now ? "border-[#448a27] bg-[#f7fbef] text-[#3c7d28] ring-[3px] ring-[#e3edda]" : "border-[#cbdaba] bg-[#faf9f4] text-[#667866]"}`}>
            {done ? <Check size={18} /> : now && status === "EM_ROTA" ? <Truck size={17} /> : now ? <Circle size={12} /> : <span className="text-xs font-bold">{i + 1}</span>}
          </span>
          <span className={`text-[11px] font-bold ${done || now ? "text-[#2e6e29]" : "text-[#697c63]"}`}>{step}</span>
          <span className="max-w-[135px] text-[10px] leading-snug text-[#85927d]">{i === 0 ? "Frete associado à sua conta" : i === 1 ? "Coleta não monitorada pelo sistema" : i === 2 ? status === "EM_ROTA" ? "Transporte iniciado" : "Aguardando início" : "Entrega a confirmar"}</span>
        </div>;
      })}
    </div>
  );
}

export default function MyFreightsPage() {
  const user = useAuthStore((s) => s.user);
  const all = useFreightStore(selectAllFreights);
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);
  const storeError = useFreightStore(selectFreightsError);
  const fetchFreights = useFreightStore((s) => s.fetchFreights);
  const fetchVehicles = useFreightStore((s) => s.fetchVehicles);
  const startTransport = useFreightStore((s) => s.startTransport);
  const confirmDelivery = useFreightStore((s) => s.confirmDelivery);
  const updateFreightLocally = useFreightStore((s) => s.updateFreightLocally);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const my = useMemo(() => all.filter((f) => f.transportador_id === user?.id), [all, user?.id]);
  const active = useMemo(() => my.filter((f) => f.status === "ACEITO" || f.status === "EM_ROTA").sort((a, b) => Number(b.status === "EM_ROTA") - Number(a.status === "EM_ROTA")), [my]);
  const recent = useMemo(() => my.filter((f) => f.status === "ENTREGUE").sort((a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()).slice(0, 2), [my]);
  const focusedId = expandedId === null ? active[0]?.id : expandedId;
  const load = () => Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  useEffect(() => { void Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]); }, [fetchFreights, fetchVehicles, user?.id]);

  async function advance(freight: Freight) {
    const action = freight.status === "ACEITO" ? "iniciar o transporte" : "confirmar a entrega";
    if (!window.confirm(`Deseja realmente ${action} do frete ${freight.codigo}? Essa ação altera o status da carga.`)) return;
    setBusy(freight.id); setError(""); setMessage("");
    try {
      if (freight.status === "ACEITO") { await startTransport(freight.id); setMessage("Transporte iniciado com sucesso!"); }
      else if (freight.status === "EM_ROTA") { await confirmDelivery(freight.id); setMessage("Entrega confirmada! O frete foi enviado para o Histórico."); }
      updateFreightLocally(freight.id, { pedido: freight.pedido });
      await fetchFreights(undefined, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o frete.");
      await fetchFreights(undefined, true);
    } finally { setBusy(null); }
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#142418]">
      <ProfileNavbar profileName={user?.name || "Transportador"} role="TRANSPORTADOR" links={links} notificationsHref="/transportador/notificacoes" />
      <main className="mx-auto max-w-[930px] px-5 pb-16 pt-10 md:px-9">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-[10px] font-extrabold uppercase tracking-wide text-[#317b3f]">Conta transportador · {active.length} fretes ativos</p><h1 className="mt-1 font-['Bricolage_Grotesque'] text-[30px] font-extrabold">Meus fretes</h1><p className="mt-1 text-xs text-[#7b8b78]">Acompanhe e atualize o status das suas entregas.</p></div>
          <Link to="/transportador/fretes-disponiveis" className="inline-flex items-center gap-2 rounded-xl bg-[#295f22] px-5 py-3 text-xs font-bold text-white hover:bg-[#3a792d]">Disponíveis <ArrowRight size={15}/></Link>
        </div>
        {(error || storeError) && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-xs text-red-800">{error || storeError}</p>}
        {message && <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800">{message}</p>}

        <section className="mt-6 space-y-4" aria-label="Fretes ativos">
          {loading && active.length === 0 ? <div className="rounded-xl bg-white p-10 text-center text-sm">Carregando...</div> : active.length === 0 ? <div className="rounded-2xl border border-[#dbe5d2] bg-white p-9 text-center"><Truck className="mx-auto text-[#6c9160]"/><p className="mt-3 text-sm font-bold">Nenhum frete ativo.</p><Link to="/transportador/fretes-disponiveis" className="mt-2 inline-block text-xs font-bold text-[#317d26] underline">Ver fretes disponíveis</Link></div> : active.map((freight) => {
            const expanded = focusedId === freight.id;
            const vehicle = vehicles.find((v) => v.id === freight.veiculo_id);
            return <article key={freight.id} className="rounded-2xl border border-[#d3e0be] bg-white p-4 shadow-[0_3px_10px_rgba(28,55,26,0.035)] sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3"><button type="button" aria-label={expanded ? "Recolher frete" : "Expandir frete"} aria-expanded={expanded} onClick={() => setExpandedId(expanded ? "" : freight.id)} className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#dae6cd] text-[#76946f]"><ChevronDown size={16} className={`transition ${expanded ? "rotate-180" : ""}`}/></button><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-['Bricolage_Grotesque'] text-base font-extrabold">{freight.codigo} · {freight.pedido?.oferta?.produto || "Carga agrícola"}</h2><span className="rounded-full bg-[#dbeefd] px-3 py-1 text-[10px] font-bold text-[#31708a]">● {statusText(freight.status)}</span></div><p className="mt-1 text-xs text-[#71816c]">{freight.pedido?.oferta?.categoria || "Transporte"} · {number(freight.peso_toneladas)} ton</p></div></div>
                <div className="text-right"><p className="text-[10px] text-[#879184]">Valor do frete</p><p className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-[#23431f]">{money(freight.valor_frete)}</p></div>
              </div>
              {expanded && <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#d2e3b6] bg-[#e8f2d8] px-4 py-4"><p className="text-[10px] text-[#6a7d62]">Origem</p><p className="mt-1 flex items-start gap-2 text-sm font-bold"><MapPin size={15} className="mt-0.5 text-[#397b2b]"/>{freight.endereco_origem}</p></div><div className="rounded-xl border border-[#d2e3b6] bg-[#e8f2d8] px-4 py-4"><p className="text-[10px] text-[#6a7d62]">Destino</p><p className="mt-1 flex items-start gap-2 text-sm font-bold"><MapPin size={15} className="mt-0.5 text-[#397b2b]"/>{freight.endereco_destino}</p></div></div>
                <Timeline status={freight.status}/>
                <div className="mt-7 grid gap-3 border-t border-[#dce7cc] pt-4 text-xs sm:grid-cols-4"><div><p className="text-[#7b8b75]">Peso da carga</p><p className="mt-1 font-extrabold">{number(freight.peso_toneladas)} ton</p></div><div><p className="text-[#7b8b75]">Veículo associado</p><p className="mt-1 font-extrabold">{vehicle ? vehicle.tipo_veiculo : freight.veiculo_id ? "Veículo cadastrado" : "Não informado"}</p></div><div><p className="text-[#7b8b75]">Status</p><p className="mt-1 font-extrabold">{statusText(freight.status)}</p></div><div><p className="text-[#7b8b75]">Atualização do registro</p><p className="mt-1 font-extrabold">{formatDate(freight.atualizado_em)}</p></div></div>
                <p className="mt-3 text-[11px] text-[#779074]">{freight.status === "ACEITO" ? "Próximo passo: confira a carga e inicie o transporte." : "Próximo passo: ao entregar a carga no destino, confirme a entrega."} Rastreamento de distância e localização em tempo real ainda não está disponível.</p>
                <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={busy !== null} onClick={() => void advance(freight)} className="flex min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#3f8016] px-4 py-3 text-xs font-bold text-white hover:bg-[#357215] disabled:opacity-50">{busy === freight.id ? "Atualizando..." : freight.status === "ACEITO" ? "Iniciar transporte" : "Confirmar entrega"}<ArrowRight size={14}/></button><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#d2e0c4] px-4 py-3 text-xs font-bold hover:bg-[#f3f8ec]"><RefreshCw size={14}/> Atualizar dados</button><button type="button" onClick={() => setDetailsId((id) => id === freight.id ? null : freight.id)} className="rounded-xl border border-[#d2e0c4] px-4 py-3 text-xs font-bold hover:bg-[#f3f8ec]">{detailsId === freight.id ? "Ocultar detalhes" : "Ver detalhes"}</button></div>
                {detailsId === freight.id && <div className="mt-4 grid gap-3 rounded-xl border border-[#e0e8d7] bg-[#f9fbf5] p-4 text-xs sm:grid-cols-2"><p><b>Pedido:</b> {freight.pedido?.codigo || freight.pedido_id}</p><p><b>Categoria:</b> {freight.pedido?.oferta?.categoria || "Não informada"}</p><p><b>Peso:</b> {number(freight.peso_toneladas)} t</p><p><b>Valor:</b> {money(freight.valor_frete)}</p><p><b>Veículo:</b> {vehicle ? `${vehicle.tipo_veiculo} (${number(vehicle.capacidade_toneladas)} t)` : freight.veiculo_id || "Não informado"}</p><p><b>Código:</b> {freight.codigo}</p><p><b>Origem completa:</b> {freight.endereco_origem}</p><p><b>Destino completo:</b> {freight.endereco_destino}</p><p><b>Cadastrado em:</b> {new Date(freight.criado_em).toLocaleString("pt-BR")}</p><p><b>Última atualização:</b> {new Date(freight.atualizado_em).toLocaleString("pt-BR")}</p></div>}
              </>}
            </article>;
          })}
        </section>

        <section className="mt-5" aria-labelledby="recent-title"><h2 id="recent-title" className="font-['Bricolage_Grotesque'] text-sm font-extrabold">Histórico recente</h2><div className="mt-3 space-y-3">{recent.length === 0 ? <p className="rounded-xl border border-[#dce6d4] bg-white p-4 text-xs text-[#849082]">Nenhuma entrega concluída recentemente.</p> : recent.map((freight) => <Link to="/transportador/historico" key={freight.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d3e1be] bg-white px-4 py-3 hover:bg-[#fbfdf7]"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#9bc879] bg-[#d8efc4] text-[#347126]"><CheckCircle2 size={20}/></span><div><p className="text-xs font-extrabold">{freight.endereco_origem} → {freight.endereco_destino}</p><p className="mt-1 text-[10px] text-[#7d8b75]">{freight.pedido?.oferta?.produto || "Carga"} · {number(freight.peso_toneladas)} ton · Registro {formatDate(freight.atualizado_em)}</p></div></div><div className="text-right"><p className="text-xs font-extrabold text-[#254d21]">{money(freight.valor_frete)}</p><span className="mt-1 inline-block rounded-full bg-[#deeed9] px-2 py-0.5 text-[10px] font-bold text-[#397333]">● Concluído</span></div></Link>)}</div></section>
      </main>
    </div>
  );
}
