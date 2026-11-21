
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Circle, Clock3, MapPin, Star, Truck, Wallet,
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
const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (v: number | string) => Number(v).toLocaleString("pt-BR");
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
};
const inCurrentMonth = (date: string) => {
  const now = new Date();
  const d = new Date(date);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};
const inCurrentWeek = (date: string) => {
  const now = new Date();
  const d = new Date(date);
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return d >= monday && d <= now;
};
const displayedValue = (f: Freight) => f.valor_frete == null ? "A confirmar" : money(Number(f.valor_frete));

function StatCard({ label, value, note, Icon, dark = false }: {
  label: string; value: string; note: string; Icon: typeof Truck; dark?: boolean;
}) {
  return (
    <article className={`min-h-[132px] rounded-2xl border px-5 py-4 shadow-[0_4px_12px_rgba(28,52,28,0.035)] ${dark ? "border-[#1b3923] bg-[#17351f] text-white" : "border-[#e0e7d9] bg-white text-[#142418]"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`pt-1 text-[11px] font-semibold ${dark ? "text-white/75" : "text-[#677568]"}`}>{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${dark ? "bg-white/10 text-[#c4f536]" : "bg-[#eaf5cc] text-[#3b751e]"}`}><Icon size={17} /></span>
      </div>
      <p className="mt-3 font-['Bricolage_Grotesque'] text-[27px] font-extrabold leading-none">{value}</p>
      <p className={`mt-3 text-[10px] leading-relaxed ${dark ? "text-white/55" : "text-[#8b9588]"}`}>{note}</p>
    </article>
  );
}

export default function CarrierPage() {
  const user = useAuthStore((s) => s.user);
  const freights = useFreightStore(selectAllFreights);
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);
  const error = useFreightStore(selectFreightsError);
  const vehiclesError = useFreightStore((s) => s.vehicles.error);
  const vehiclesLoading = useFreightStore((s) => s.vehicles.isLoading);
  const fetchFreights = useFreightStore((s) => s.fetchFreights);
  const fetchVehicles = useFreightStore((s) => s.fetchVehicles);
  const [salutation, setSalutation] = useState(greeting);

  const refresh = useCallback(() => {
    void Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  }, [fetchFreights, fetchVehicles]);

  useEffect(() => {
    refresh();
    const handleVisible = () => {
      setSalutation(greeting());
      if (document.visibilityState === "visible") refresh();
    };
    const timer = window.setInterval(handleVisible, 60_000);
    document.addEventListener("visibilitychange", handleVisible);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", handleVisible); };
  }, [refresh]);

  const myFreights = useMemo(() => freights.filter((f) => f.transportador_id === user?.id), [freights, user?.id]);
  const active = myFreights.filter((f) => f.status === "ACEITO" || f.status === "EM_ROTA");
  const completed = myFreights.filter((f) => f.status === "ENTREGUE");
  const monthly = completed.filter((f) => inCurrentMonth(f.atualizado_em));
  const known = monthly.filter((f) => f.valor_frete != null);
  const missing = monthly.length - known.length;
  const earnings = known.reduce((sum, f) => sum + Number(f.valor_frete), 0);
  const earningsLabel = missing > 0 && known.length === 0 ? "A confirmar" : money(earnings);
  const available = freights.filter((f) => f.status === "DISPONIVEL" && !f.transportador_id);
  const featured = [...active].sort((a, b) => Number(b.status === "EM_ROTA") - Number(a.status === "EM_ROTA"))[0];
  const firstName = user?.name?.trim().split(" ")[0] || "Transportador";
  const headerDate = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "short" }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#132216]">
      <ProfileNavbar profileName={user?.name || "Transportador"} role="TRANSPORTADOR" links={links} notificationsHref="/transportador/notificacoes" />
      <main className="mx-auto max-w-[1280px] px-5 pb-14 pt-7 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#2d7137]">Conta transportador · {headerDate}</p>
            <h1 className="mt-1 font-['Bricolage_Grotesque'] text-[30px] font-extrabold tracking-tight md:text-[32px]">{salutation}, {firstName}!</h1>
            <p className="mt-1 text-xs text-[#829084]">Acompanhe seus fretes e encontre novas oportunidades.</p>
          </div>
          <Link to="/transportador/fretes-disponiveis" className="inline-flex items-center gap-2 rounded-xl bg-[#baf332] px-5 py-3 text-xs font-extrabold text-[#193316] hover:bg-[#d0fa66]">Ver fretes disponíveis <ArrowRight size={16} /></Link>
        </div>

        {!vehiclesLoading && vehicles.length === 0 && !vehiclesError && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9e8b6] bg-[#f0f8db] px-5 py-4 text-xs">
            <span><b>Você ainda não tem veículos cadastrados.</b> Cadastre um veículo para poder aceitar fretes.</span>
            <Link to="/transportador/fretes-disponiveis#frota" className="font-bold text-[#2d7027] underline">Gerenciar minha frota</Link>
          </div>
        )}
        {vehiclesError && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Não foi possível consultar sua frota: {vehiclesError}</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{error}</p>}

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores do transportador">
          <StatCard dark label="Fretes esta semana" value={loading && !freights.length ? "—" : String(myFreights.filter((f) => inCurrentWeek(f.criado_em)).length)} note="Fretes da sua conta registrados nesta semana" Icon={Truck} />
          <StatCard label="Km rodados" value="—" note="Distância percorrida ainda não registrada pela plataforma" Icon={Clock3} />
          <StatCard label="Ganhos no mês" value={loading && !freights.length ? "—" : earningsLabel} note={missing > 0 ? `${missing} frete(s) com valor a confirmar. Não indica pagamento recebido.` : "Valores informados dos fretes entregues; não confirma pagamento."} Icon={Wallet} />
          <StatCard label="Avaliação média" value="—" note="Avaliações serão exibidas quando o recurso estiver disponível" Icon={Star} />
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(280px,1fr)] lg:items-start">
          <section className="rounded-2xl border border-[#e0e6dc] bg-white p-4 shadow-[0_7px_20px_rgba(23,43,26,0.055)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-['Bricolage_Grotesque'] text-base font-extrabold">Frete em andamento</h2>
              {featured && <span className="rounded-full bg-[#e4f4fa] px-3 py-1 text-[9px] font-extrabold uppercase text-[#357c8f]">{featured.status === "EM_ROTA" ? "Em transporte" : "Aguardando início"}</span>}
            </div>
            {!featured ? (
              <div className="mt-4 rounded-xl bg-[#f8f8f1] p-6 text-center text-sm text-[#6b7968]">{loading ? "Carregando fretes..." : "Nenhum frete em andamento."}<div className="mt-3"><Link className="font-bold text-[#2c6825] underline" to="/transportador/fretes-disponiveis">Encontrar fretes</Link></div></div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#faf9f3] px-4 py-3">
                  <div>
                    <p className="font-['Bricolage_Grotesque'] text-sm font-extrabold">{featured.codigo} · {featured.pedido?.oferta?.produto || "Carga agrícola"}</p>
                    <p className="mt-1 text-[11px] text-[#7a8675]">{num(featured.peso_toneladas)} toneladas · {featured.pedido?.oferta?.categoria || "Carga"}</p>
                  </div>
                  <div className="text-right"><p className="text-[9px] uppercase text-[#7e897e]">Valor do frete</p><p className="font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1d4020]">{displayedValue(featured)}</p></div>
                </div>
                <div className="mt-3 grid items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-xl border border-[#d6e6bd] bg-[#e9f3d9] px-3 py-3"><p className="text-[10px] text-[#566b54]">Origem</p><p className="mt-1 flex items-start gap-1 text-xs font-bold"><MapPin size={14} className="mt-0.5 shrink-0 text-[#4a7d35]" />{featured.endereco_origem}</p></div>
                  <ArrowRight size={17} className="mx-auto hidden text-[#80977a] sm:block" />
                  <div className="rounded-xl border border-[#d6e6bd] bg-[#e9f3d9] px-3 py-3"><p className="text-[10px] text-[#566b54]">Destino</p><p className="mt-1 flex items-start gap-1 text-xs font-bold"><MapPin size={14} className="mt-0.5 shrink-0 text-[#4a7d35]" />{featured.endereco_destino}</p></div>
                </div>
                <div className="relative mt-5 grid grid-cols-4 gap-1 text-center">
                  <div className="absolute left-[12.5%] right-[12.5%] top-[8px] h-[2px] bg-[#dbe5d6]" aria-hidden="true" />
                  {["Frete aceito", "Em coleta", "Em transporte", "Entregue"].map((label, i) => {
                    const done = i === 0 || (featured.status === "EM_ROTA" && i <= 2);
                    return <div key={label} className="relative z-10 flex flex-col items-center gap-1"><span className={`grid h-[17px] w-[17px] place-items-center rounded-full border ${done ? "border-[#378337] bg-[#378337] text-white" : "border-[#c8d6c3] bg-white text-transparent"}`}>{done ? <Check size={11} strokeWidth={3} /> : <Circle size={8} />}</span><span className={`text-[9px] ${done ? "font-bold text-[#326c35]" : "text-[#8a978b]"}`}>{label}</span></div>;
                  })}
                </div>
                <Link to="/transportador/meus-fretes" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#193a22] px-4 py-3 text-xs font-bold text-white hover:bg-[#2c5f30]">Ver detalhes e acompanhar <ArrowRight size={15} /></Link>
              </>
            )}
          </section>

          <aside className="rounded-2xl bg-[#17351f] p-5 text-white shadow-[0_7px_20px_rgba(23,43,26,0.06)]">
            <h2 className="font-['Bricolage_Grotesque'] text-lg font-extrabold">{available.length} novos fretes disponíveis</h2>
            <p className="mt-2 text-[11px] leading-relaxed text-white/65">Confira as cargas disponíveis para transporte.</p>
            <div className="mt-4 space-y-3">
              {available.length === 0 ? <p className="rounded-xl bg-white/10 p-4 text-xs text-white/75">Nenhuma oportunidade disponível no momento.</p> : available.slice(0, 2).map((f) => (
                <div key={f.id} className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <p className="truncate text-[11px] font-semibold text-[#c7f83f]">{f.endereco_origem} → {f.endereco_destino}</p>
                  <p className="mt-2 font-['Bricolage_Grotesque'] text-xl font-extrabold">{displayedValue(f)}</p>
                  <p className="mt-1 text-[10px] text-white/60">{f.pedido?.oferta?.produto || "Carga agrícola"} · {num(f.peso_toneladas)} t</p>
                </div>
              ))}
            </div>
            <Link to="/transportador/fretes-disponiveis" className="mt-4 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#16331e] hover:bg-[#f2f8e9]">Ver fretes disponíveis</Link>
          </aside>
        </div>
        <p className="mt-4 text-[10px] text-[#889387]">Informações calculadas a partir dos fretes registrados na sua conta. Dados de distância, rastreamento e avaliações dependem de funcionalidades ainda não integradas.</p>
      </main>
    </div>
  );
}