import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Circle,
  Clock3,
  MapPin,
  Star,
  Truck,
  Wallet,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import type { Freight } from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectAllFreights,
  selectFreightsError,
  selectFreightsLoading,
  selectVehicles,
  useFreightStore,
} from "../../stores/freightStore";

const NAV_LINKS = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];

const formatMoney = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const formatNumber = (value: number | string) =>
  Number(value).toLocaleString("pt-BR");

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const isInCurrentMonth = (date: string) => {
  const currentDate = new Date();
  const targetDate = new Date(date);

  return (
    targetDate.getMonth() === currentDate.getMonth() &&
    targetDate.getFullYear() === currentDate.getFullYear()
  );
};

const isInCurrentWeek = (date: string) => {
  const currentDate = new Date();
  const targetDate = new Date(date);
  const monday = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return targetDate >= monday && targetDate <= currentDate;
};

const getFreightValue = (freight: Freight) =>
  freight.valor_frete == null
    ? "A confirmar"
    : formatMoney(Number(freight.valor_frete));

type StatCardProps = {
  label: string;
  value: string;
  note: string;
  Icon: typeof Truck;
  dark?: boolean;
};

function StatCard({ label, value, note, Icon, dark = false }: StatCardProps) {
  const cardStyle = dark
    ? "border-[#1b3923] bg-[#17351f] text-white"
    : "border-[#e0e7d9] bg-white text-[#142418]";
  const labelStyle = dark ? "text-white/75" : "text-[#677568]";
  const iconStyle = dark
    ? "bg-white/10 text-[#c4f536]"
    : "bg-[#eaf5cc] text-[#3b751e]";
  const noteStyle = dark ? "text-white/55" : "text-[#677568]";

  return (
    <article
      className={`min-h-[132px] rounded-2xl border px-5 py-4 shadow-[0_4px_12px_rgba(28,52,28,0.035)] ${cardStyle}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={`pt-1 text-xs font-semibold ${labelStyle}`}>{label}</p>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${iconStyle}`}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>

      <p className="mt-3 break-words font-['Bricolage_Grotesque'] text-xl font-extrabold leading-tight sm:text-2xl">
        {value}
      </p>
      <p className={`mt-2 text-xs leading-relaxed ${noteStyle}`}>{note}</p>
    </article>
  );
}

function FreightProgress({ status }: { status: Freight["status"] }) {
  const steps = ["Frete aceito", "Em coleta", "Em transporte", "Entregue"];

  return (
    <div className="relative mt-5 grid grid-cols-4 gap-1 text-center">
      <div
        className="absolute left-[12.5%] right-[12.5%] top-2 h-0.5 bg-[#dbe5d6]"
        aria-hidden="true"
      />

      {steps.map((step, index) => {
        const isComplete = index === 0 || (status === "EM_ROTA" && index <= 2);

        return (
          <div
            key={step}
            className="relative z-10 flex flex-col items-center gap-1"
          >
            <span
              className={`grid size-4 place-items-center rounded-full border ${
                isComplete
                  ? "border-[#378337] bg-[#378337] text-white"
                  : "border-[#c8d6c3] bg-white text-transparent"
              }`}
            >
              {isComplete ? (
                <Check size={11} strokeWidth={3} />
              ) : (
                <Circle size={8} />
              )}
            </span>
            <span
              className={`text-xs ${
                isComplete ? "font-bold text-[#2d7027]" : "text-[#80977a]"
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function CarrierPage() {
  const user = useAuthStore((state) => state.user);
  const freights = useFreightStore(selectAllFreights);
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);
  const error = useFreightStore(selectFreightsError);
  const vehiclesError = useFreightStore((state) => state.vehicles.error);
  const vehiclesLoading = useFreightStore((state) => state.vehicles.isLoading);
  const fetchFreights = useFreightStore((state) => state.fetchFreights);
  const fetchVehicles = useFreightStore((state) => state.fetchVehicles);
  const [salutation, setSalutation] = useState(getGreeting);

  const refresh = useCallback(() => {
    void Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  }, [fetchFreights, fetchVehicles]);

  useEffect(() => {
    refresh();

    const handleVisibilityChange = () => {
      setSalutation(getGreeting());
      if (document.visibilityState === "visible") refresh();
    };

    const intervalId = window.setInterval(handleVisibilityChange, 60_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refresh]);

  const myFreights = useMemo(
    () => freights.filter((freight) => freight.transportador_id === user?.id),
    [freights, user?.id],
  );

  const activeFreights = myFreights.filter(
    (freight) => freight.status === "ACEITO" || freight.status === "EM_ROTA",
  );
  const completedFreights = myFreights.filter(
    (freight) => freight.status === "ENTREGUE",
  );
  const monthlyFreights = completedFreights.filter((freight) =>
    isInCurrentMonth(freight.atualizado_em),
  );
  const freightsWithValue = monthlyFreights.filter(
    (freight) => freight.valor_frete != null,
  );
  const missingValues = monthlyFreights.length - freightsWithValue.length;
  const monthlyEarnings = freightsWithValue.reduce(
    (total, freight) => total + Number(freight.valor_frete),
    0,
  );
  const earningsLabel =
    missingValues > 0 && freightsWithValue.length === 0
      ? "A confirmar"
      : formatMoney(monthlyEarnings);

  const availableFreights = freights.filter(
    (freight) => freight.status === "DISPONIVEL" && !freight.transportador_id,
  );
  const featuredFreight = [...activeFreights].sort(
    (a, b) => Number(b.status === "EM_ROTA") - Number(a.status === "EM_ROTA"),
  )[0];
  const firstName = user?.name?.trim().split(" ")[0] || "Transportador";
  const weeklyFreightCount = myFreights.filter((freight) =>
    isInCurrentWeek(freight.criado_em),
  ).length;

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#132216]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={NAV_LINKS}
        notificationsHref="/transportador/notificacoes"
      />

      <main className="mx-auto w-full max-w-[1280px] px-5 pb-14 pt-7 md:px-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="mt-1 font-sans text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
              {salutation}, {firstName}!
            </h1>
            <p className="mt-1 text-xs text-[#829084]">
              Acompanhe seus fretes e encontre novas oportunidades.
            </p>
          </div>

          <Link
            to="/transportador/fretes-disponiveis"
            className="inline-flex items-center gap-2 rounded-xl bg-[#baf332] px-5 py-3 text-xs font-extrabold text-[#193316] transition-colors hover:bg-[#d0fa66]"
          >
            Ver fretes disponíveis
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </header>

        {!vehiclesLoading && vehicles.length === 0 && !vehiclesError && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d9e8b6] bg-[#f0f8db] px-5 py-4 text-sm">
            <span>
              <strong>Você ainda não tem veículos cadastrados.</strong> Cadastre
              um veículo para poder aceitar fretes.
            </span>
            <Link
              to="/transportador/fretes-disponiveis#frota"
              className="font-bold text-[#2d7027] underline underline-offset-2"
            >
              Gerenciar minha frota
            </Link>
          </div>
        )}

        {vehiclesError && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
          >
            Não foi possível consultar sua frota: {vehiclesError}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <section
          className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Indicadores do transportador"
        >
          <StatCard
            dark
            label="Fretes esta semana"
            value={
              loading && freights.length === 0
                ? "—"
                : String(weeklyFreightCount)
            }
            note="Fretes da sua conta registrados nesta semana"
            Icon={Truck}
          />
          <StatCard
            label="Km rodados"
            value="—"
            note="Distância percorrida ainda não registrada pela plataforma"
            Icon={Clock3}
          />
          <StatCard
            label="Ganhos no mês"
            value={loading && freights.length === 0 ? "—" : earningsLabel}
            note={
              missingValues > 0
                ? `${missingValues} frete(s) com valor a confirmar. Não indica pagamento recebido.`
                : "Valores informados dos fretes entregues; não confirma pagamento."
            }
            Icon={Wallet}
          />
          <StatCard
            label="Avaliação média"
            value="—"
            note="Avaliações serão exibidas quando o recurso estiver disponível"
            Icon={Star}
          />
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,2.25fr)_minmax(280px,1fr)] lg:items-start">
          <section className="rounded-2xl border border-[#e0e6dc] bg-white p-4 shadow-[0_7px_20px_rgba(23,43,26,0.055)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-['Bricolage_Grotesque'] font-extrabold leading-snug">
                Frete em andamento
              </h2>
            </div>

            {!featuredFreight ? (
              <div className="mt-4 rounded-xl bg-[#f8f9f5] p-6 text-center text-sm text-[#677568]">
                {loading
                  ? "Carregando fretes..."
                  : "Nenhum frete em andamento."}
                <div className="mt-3">
                  <Link
                    className="font-semibold text-[#2d7027] underline underline-offset-2"
                    to="/transportador/fretes-disponiveis"
                  >
                    Encontrar fretes
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F0F3EA]/50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="break-words font-bold">
                      {featuredFreight.codigo} ·{" "}
                      {featuredFreight.pedido?.oferta?.produto ||
                        "Carga agrícola"}
                    </p>
                    <p className="mt-1 text-xs text-[#677568]">
                      {formatNumber(featuredFreight.peso_toneladas)} toneladas ·{" "}
                      {featuredFreight.pedido?.oferta?.categoria || "Carga"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs uppercase text-[#677568]">
                      Valor do frete
                    </p>
                    <p className="mt-1 font-['Bricolage_Grotesque'] text-lg font-extrabold text-[#1d4020]">
                      {getFreightValue(featuredFreight)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                  <div className="min-w-0 rounded-xl bg-[#f0f8db] px-3 py-3">
                    <p className="text-xs text-[#2d7027]">Origem</p>
                    <p className="mt-1 flex items-start gap-1 text-xs font-bold">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#4a7d35]"
                        aria-hidden="true"
                      />
                      <span className="break-words">
                        {featuredFreight.endereco_origem}
                      </span>
                    </p>
                  </div>

                  <ArrowRight
                    size={18}
                    className="mx-auto hidden self-center text-[#80977a] sm:block"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 rounded-xl bg-[#f0f8db] px-3 py-3">
                    <p className="text-xs text-[#2d7027]">Destino</p>
                    <p className="mt-1 flex items-start gap-1 text-xs font-bold">
                      <MapPin
                        size={16}
                        className="mt-0.5 shrink-0 text-[#4a7d35]"
                        aria-hidden="true"
                      />
                      <span className="break-words">
                        {featuredFreight.endereco_destino}
                      </span>
                    </p>
                  </div>
                </div>

                <FreightProgress status={featuredFreight.status} />

                <Link
                  to="/transportador/meus-fretes"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#193a22] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#2c5f30]"
                >
                  Ver detalhes e acompanhar
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </>
            )}
          </section>

          <aside className="rounded-2xl bg-[#17351f] p-5 text-white shadow-[0_7px_20px_rgba(23,43,26,0.06)]">
            <h2 className="text-lg font-['Bricolage_Grotesque'] font-extrabold leading-snug">
              {availableFreights.length} novos fretes disponíveis
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/60">
              Confira as cargas disponíveis para transporte.
            </p>

            <div className="mt-4 space-y-3">
              {availableFreights.length === 0 ? (
                <p className="rounded-xl bg-white/10 p-4 text-sm text-white/75">
                  Nenhuma oportunidade disponível no momento.
                </p>
              ) : (
                availableFreights.slice(0, 2).map((freight) => (
                  <div
                    key={freight.id}
                    className="rounded-xl border border-white/10 bg-white/10 p-4"
                  >
                    <p className="truncate text-xs font-semibold text-[#c7f83f]">
                      {freight.endereco_origem} → {freight.endereco_destino}
                    </p>
                    <p className="mt-2 break-words font-['Bricolage_Grotesque'] text-xl font-extrabold">
                      {getFreightValue(freight)}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {freight.pedido?.oferta?.produto || "Carga agrícola"} ·{" "}
                      {formatNumber(freight.peso_toneladas)} t
                    </p>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/transportador/fretes-disponiveis"
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-xs font-extrabold text-[#16331e] transition-colors hover:bg-[#f2f8e9]"
            >
              Ver fretes disponíveis
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
