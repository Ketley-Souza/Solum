import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  MapPin,
  RefreshCw,
  Truck,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import type { Freight } from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectAllFreights,
  selectFreightsLoading,
  selectVehicles,
  useFreightStore,
} from "../../stores/freightStore";

const links = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];

const money = (value: Freight["valor_frete"]) =>
  value == null
    ? "A confirmar"
    : Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

const number = (value: string | number) =>
  Number(value).toLocaleString("pt-BR");

const date = (value: string) => new Date(value).toLocaleDateString("pt-BR");

const dateTime = (value: string) => new Date(value).toLocaleString("pt-BR");

const statusText = (status: Freight["status"]) =>
  status === "ACEITO"
    ? "Aguardando início"
    : status === "EM_ROTA"
      ? "Em rota"
      : "Entregue";

function Timeline({ status }: { status: Freight["status"] }) {
  const current = status === "ACEITO" ? 1 : 3;

  const steps = [
    { label: "Frete aceito", description: "Frete associado à sua conta" },
    { label: "Em coleta", description: "Coleta não monitorada pelo sistema" },
    {
      label: "Em rota",
      description:
        status === "EM_ROTA" ? "Transporte iniciado" : "Aguardando início",
    },
    { label: "Entregue", description: "Entrega a confirmar" },
  ];

  return (
    <div
      className="relative mt-7 grid grid-cols-4 gap-1"
      aria-label={`Progresso: ${statusText(status)}`}
    >
      <div className="absolute left-[12%] right-[12%] top-4 h-0.5 bg-[#e3eadf]" />
      <div
        className="absolute left-[12%] top-4 h-0.5 bg-[#438337] transition-all"
        style={{ width: `${(current - 1) * 25}%` }}
      />

      {steps.map((step, index) => {
        const done = index + 1 < current;
        const now = index + 1 === current;

        return (
          <div
            key={step.label}
            className="relative z-10 flex flex-col items-center gap-2 text-center"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-full border-2 ${
                done
                  ? "border-[#438337] bg-[#438337] text-white"
                  : now
                    ? "border-[#438337] bg-[#f0f6eb] text-[#438337] ring-4 ring-[#eaf2e5]"
                    : "border-[#d5dfd0] bg-white text-[#82917d]"
              }`}
            >
              {done ? (
                <Check size={16} />
              ) : now && status === "EM_ROTA" ? (
                <Truck size={16} />
              ) : now ? (
                <Circle size={11} />
              ) : (
                <span className="text-[10px] font-bold">{index + 1}</span>
              )}
            </span>
            <span
              className={`text-[10px] font-bold sm:text-[11px] ${done || now ? "text-[#397532]" : "text-[#82917d]"}`}
            >
              {step.label}
            </span>
            <span className="hidden max-w-[135px] text-[10px] leading-snug text-[#929d8e] sm:block">
              {step.description}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyFreightsPage() {
  const user = useAuthStore((s) => s.user);
  const all = useFreightStore(selectAllFreights);
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);

  const fetchFreights = useFreightStore((s) => s.fetchFreights);
  const fetchVehicles = useFreightStore((s) => s.fetchVehicles);
  const startTransport = useFreightStore((s) => s.startTransport);
  const confirmDelivery = useFreightStore((s) => s.confirmDelivery);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const my = useMemo(
    () => all.filter((freight) => freight.transportador_id === user?.id),
    [all, user?.id],
  );

  const active = useMemo(
    () =>
      my
        .filter(
          (freight) =>
            freight.status === "ACEITO" || freight.status === "EM_ROTA",
        )
        .sort(
          (a, b) =>
            Number(b.status === "EM_ROTA") - Number(a.status === "EM_ROTA"),
        ),
    [my],
  );

  const recent = useMemo(
    () =>
      my
        .filter((freight) => freight.status === "ENTREGUE")
        .sort(
          (a, b) =>
            new Date(b.atualizado_em).getTime() -
            new Date(a.atualizado_em).getTime(),
        )
        .slice(0, 2),
    [my],
  );

  // null: primeiro frete aberto por padrão. String vazia: todos recolhidos.
  const focusedId =
    expandedId === null ? active[0]?.id : expandedId || undefined;

  async function load() {
    await Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  }

  useEffect(() => {
    void load();
  }, [fetchFreights, fetchVehicles, user?.id]);

  async function advance(freight: Freight) {
    const action =
      freight.status === "ACEITO"
        ? "iniciar o transporte"
        : "confirmar a entrega";
    const confirmed = window.confirm(
      `Deseja realmente ${action} do frete ${freight.codigo}? Essa ação altera o status da carga.`,
    );

    if (!confirmed) return;

    setBusy(freight.id);
    setError("");
    setMessage("");

    try {
      if (freight.status === "ACEITO") {
        await startTransport(freight.id);
        setMessage("Transporte iniciado com sucesso!");
      } else if (freight.status === "EM_ROTA") {
        await confirmDelivery(freight.id);
        setMessage("Entrega confirmada! O frete foi enviado para o Histórico.");
      }

      await fetchFreights(undefined, true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o frete.",
      );
      await fetchFreights(undefined, true);
    } finally {
      setBusy(null);
    }
  }

  function toggleFreight(id: string, expanded: boolean) {
    setExpandedId(expanded ? "" : id);
    setDetailsId(null);
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#142418]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={links}
        notificationsHref="/transportador/notificacoes"
      />

      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 md:px-12">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mt-1 font-sans text-[24px] font-extrabold tracking-tight md:text-[28px]">
              Meus fretes
            </h1>
            <p className="mt-1 text-xs text-[#829084]">
              Acompanhe suas cargas e atualize o andamento das entregas.
            </p>
          </div>

          <Link
            to="/transportador/fretes-disponiveis"
            className="inline-flex items-center gap-2 rounded-xl bg-[#295f22] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#3a792d]"
          >
            Fretes disponíveis
            <ArrowRight size={15} />
          </Link>
        </div>

        {message && (
          <div className="mt-5 rounded-xl border border-[#cce5cf] bg-[#edf7ed] px-4 py-3 text-xs font-semibold text-[#34733a]">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-5 rounded-xl border border-[#f0d0cc] bg-[#fff2f0] px-4 py-3 text-xs font-semibold text-[#a33e35]">
            {error}
          </div>
        )}

        {/* Fretes ativos */}
        <section className="mt-8" aria-label="Fretes ativos">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold">Entregas em andamento</h2>
              <p className="mt-1 text-[11px] text-[#849184]">
                {active.length} aguardando conclusão.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2.5 text-[11px] font-bold text-[#386c32] transition hover:bg-[#f0f6ec] disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-[0_4px_15px_rgba(24,48,28,0.045)]">
            {loading && active.length === 0 ? (
              <p className="p-8 text-center text-xs text-[#849184]">
                Carregando fretes...
              </p>
            ) : active.length === 0 ? (
              <div className="p-10 text-center">
                <Truck size={30} className="mx-auto text-[#85a77e]" />
                <p className="mt-3 text-sm font-bold">Nenhum frete ativo</p>
                <p className="mt-1 text-xs text-[#849184]">
                  Quando você aceitar um frete, ele aparecerá aqui.
                </p>
                <Link
                  to="/transportador/fretes-disponiveis"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#317d26] hover:underline"
                >
                  Ver fretes disponíveis
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              active.map((freight, index) => {
                const expanded = focusedId === freight.id;
                const vehicle = vehicles.find(
                  (v) => v.id === freight.veiculo_id,
                );

                return (
                  <article
                    key={freight.id}
                    className={index ? "border-t border-[#e4eae1]" : ""}
                  >
                    {/* Resumo do frete */}
                    <button
                      type="button"
                      onClick={() => toggleFreight(freight.id, expanded)}
                      aria-expanded={expanded}
                      className="flex w-full flex-col gap-3 px-4 py-4 text-left transition hover:bg-[#fbfdf9] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf5e6] text-[#3b7a29]">
                          <Truck size={19} />
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-extrabold sm:text-sm">
                              {freight.pedido?.oferta?.produto ||
                                "Carga agrícola"}{" "}
                              · {freight.codigo}
                            </p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                                freight.status === "EM_ROTA"
                                  ? "bg-[#e3f3e6] text-[#388653]"
                                  : "bg-[#edf2e9] text-[#647d57]"
                              }`}
                            >
                              {statusText(freight.status)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-[#839081]">
                            {freight.endereco_origem} →{" "}
                            {freight.endereco_destino}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pl-14 sm:justify-end sm:pl-0">
                        <div>
                          <p className="text-[9px] uppercase tracking-wide text-[#849183]">
                            Valor do frete
                          </p>
                          <p className="mt-1 text-xs font-extrabold text-[#254d21]">
                            {money(freight.valor_frete)}
                          </p>
                        </div>
                        <ChevronDown
                          size={17}
                          className={`shrink-0 text-[#718674] transition ${expanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {/* Detalhes */}
                    {expanded && (
                      <div className="border-t border-[#ecf0e9] bg-[#fafcf7] px-4 py-5 sm:px-5">
                        {/* Painel de percurso, acompanhamento e informações */}

                        {/* Origem e destino */}
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-8 rounded-2xl border border-[#e1e9db] bg-white px-4 py-5 sm:px-6">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#849184]">
                              Origem
                            </p>
                            <p className="mt-2 flex items-start gap-2 text-xs font-bold leading-relaxed text-[#334c30]">
                              <MapPin
                                size={15}
                                className="mt-0.5 shrink-0 text-[#438337]"
                              />
                              <span className="break-words">
                                {freight.endereco_origem}
                              </span>
                            </p>
                          </div>

                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#edf5e9] text-[#438337]">
                            <ArrowLeftRight size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#849184]">
                              Destino
                            </p>
                            <p className="mt-2 flex items-start gap-2 text-xs font-bold leading-relaxed text-[#334c30]">
                              <MapPin
                                size={15}
                                className="mt-0.5 shrink-0 text-[#438337]"
                              />
                              <span className="break-words">
                                {freight.endereco_destino}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Acompanhamento e informações adicionais */}
                        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e1e9db] bg-white">
                          <div className="px-4 py-5 sm:px-6">
                            <p className="text-xs font-extrabold text-[#243a26]">
                              Acompanhamento da entrega
                            </p>
                            <Timeline status={freight.status} />
                          </div>

                          {/* Divisor com margens laterais */}
                          <div className="mx-4 border-t border-[#e1e9db] sm:mx-6" />

                          {/* Informações adicionais */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-3 px-3 py-4 sm:grid-cols-4 sm:px-6">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-[10px] text-[#849183]">
                                PESO:
                              </span>
                              <span className="text-xs font-semibold text-[#263c29]">
                                {number(freight.peso_toneladas)} ton
                              </span>
                            </div>

                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-[10px] text-[#849183]">
                                VEÍCULO:
                              </span>
                              <span className="text-xs font-semibold text-[#263c29]">
                                {vehicle
                                  ? vehicle.tipo_veiculo
                                  : freight.veiculo_id
                                    ? "Cadastrado"
                                    : "Não informado"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-[10px] text-[#849183]">
                                CATEGORIA:
                              </span>
                              <span className="text-xs font-semibold text-[#263c29]">
                                {freight.pedido?.oferta?.categoria ||
                                  "Não informada"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-baseline gap-1">
                              <span className="text-[10px] text-[#849183]">
                                ATUALIZAÇÃO:
                              </span>
                              <span className="text-xs font-semibold text-[#263c29]">
                                {date(freight.atualizado_em)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Orientação sobre o próximo passo */}
                        <p className="mt-4 ml-4 text-[10px] leading-relaxed text-[#7b8b79]">
                          {freight.status === "ACEITO"
                            ? "Próximo passo: confira a carga e inicie o transporte."
                            : "Próximo passo: após entregar a carga no destino, confirme a entrega."}{" "}  
                        </p>

                        {/* Ações */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => void advance(freight)}
                            className="inline-flex min-w-[180px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#3f8016] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#357215] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy === freight.id
                              ? "Atualizando..."
                              : freight.status === "ACEITO"
                                ? "Iniciar transporte"
                                : "Confirmar entrega"}
                            <ArrowRight size={14} />
                          </button>

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => void load()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-4 py-3 text-xs font-bold transition hover:bg-[#f0f6ec] disabled:opacity-50"
                          >
                            <RefreshCw size={14} />
                            Atualizar dados
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDetailsId((id) =>
                                id === freight.id ? null : freight.id,
                              )
                            }
                            aria-expanded={detailsId === freight.id}
                            className="rounded-xl border border-[#dfe6da] bg-white px-4 py-3 text-xs font-bold transition hover:bg-[#f0f6ec]"
                          >
                            {detailsId === freight.id
                              ? "Ocultar detalhes"
                              : "Ver detalhes"}
                          </button>
                        </div>

                        {/* Detalhes complementares */}
                        {detailsId === freight.id && (
                          <div className="mt-4 grid gap-3 rounded-xl border border-[#e1e9db] bg-white p-4 text-xs sm:grid-cols-2">
                            <p>
                              <b>Pedido:</b>{" "}
                              {freight.pedido?.codigo || freight.pedido_id}
                            </p>
                            <p>
                              <b>Código do frete:</b> {freight.codigo}
                            </p>
                            <p>
                              <b>Peso:</b> {number(freight.peso_toneladas)}{" "}
                              toneladas
                            </p>
                            <p>
                              <b>Valor:</b> {money(freight.valor_frete)}
                            </p>
                            <p>
                              <b>Veículo:</b>{" "}
                              {vehicle
                                ? `${vehicle.tipo_veiculo} (${number(vehicle.capacidade_toneladas)} t)`
                                : freight.veiculo_id || "Não informado"}
                            </p>
                            <p>
                              <b>Status:</b> {statusText(freight.status)}
                            </p>
                            <p>
                              <b>Cadastrado em:</b>{" "}
                              {dateTime(freight.criado_em)}
                            </p>
                            <p>
                              <b>Última atualização:</b>{" "}
                              {dateTime(freight.atualizado_em)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Histórico recente */}
        <section className="mt-9" aria-labelledby="recent-title">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="recent-title" className="text-sm font-extrabold">
                Histórico recente
              </h2>
              <p className="mt-1 text-[11px] text-[#849184]">
                Suas últimas entregas concluídas.
              </p>
            </div>
            <Link
              to="/transportador/historico"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#397532] hover:underline"
            >
              Ver histórico
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-[#dfe6dc] bg-white shadow-[0_4px_15px_rgba(24,48,28,0.045)]">
            {recent.length === 0 ? (
              <div className="p-7 text-center">
                <CheckCircle2 size={25} className="mx-auto text-[#85a77e]" />
                <p className="mt-2 text-xs font-bold">
                  Nenhuma entrega concluída recentemente.
                </p>
                <p className="mt-1 text-[10px] text-[#849184]">
                  Suas entregas finalizadas aparecerão aqui.
                </p>
              </div>
            ) : (
              recent.map((freight, index) => (
                <Link
                  to="/transportador/historico"
                  key={freight.id}
                  className={`flex flex-col gap-3 px-4 py-4 transition hover:bg-[#fbfdf9] sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
                    index ? "border-t border-[#e4eae1]" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#edf5e6] text-[#3b7a29]">
                      <CheckCircle2 size={19} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold">
                        {freight.pedido?.oferta?.produto || "Carga agrícola"} ·{" "}
                        {freight.codigo}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-[#839081]">
                        {freight.endereco_origem} → {freight.endereco_destino}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pl-[52px] sm:justify-end sm:pl-0">
                    <div>
                      <p className="text-[9px] uppercase tracking-wide text-[#849183]">
                        Concluído em
                      </p>
                      <p className="mt-1 text-[11px] text-[#40513d]">
                        {date(freight.atualizado_em)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-[#254d21]">
                        {money(freight.valor_frete)}
                      </p>
                      <span className="mt-1 inline-block rounded-full bg-[#e3f3e6] px-2.5 py-1 text-[9px] font-bold text-[#388653]">
                        Entregue
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
