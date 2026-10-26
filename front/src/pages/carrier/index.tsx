import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  FileText,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProfileNavbar from "../../components/ProfileNavbar";
import {
  transportService,
  type Freight,
} from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";

const links = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  featured = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Truck;
  featured?: boolean;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${
        featured
          ? "border-[#193c22] bg-[#193c22] text-white"
          : "border-[#e0e6dc] bg-white text-[#102217]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`text-sm ${
            featured ? "text-white/75" : "text-[#708077]"
          }`}
        >
          {label}
        </p>

        <span
          className={`grid size-10 place-items-center rounded-xl ${
            featured
              ? "bg-white/10 text-[#c1f23c]"
              : "bg-[#e8f3dc] text-[#2f681f]"
          }`}
        >
          <Icon size={19} />
        </span>
      </div>

      <p className="mt-4 font-['Bricolage_Grotesque'] text-3xl font-extrabold">
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          featured ? "text-white/60" : "text-[#8a978b]"
        }`}
      >
        {description}
      </p>
    </article>
  );
}

export default function CarrierPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const result = await transportService.listFreights();
      setFreights(result);
    } catch (err) {
      setFreights([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o painel.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const myFreights = freights.filter(
    (freight) => freight.transportador_id === user?.id,
  );

  const active = myFreights.filter(
    (freight) =>
      freight.status === "ACEITO" ||
      freight.status === "EM_ROTA",
  );

  const completed = myFreights.filter(
    (freight) => freight.status === "ENTREGUE",
  );

  const available = freights
    .filter(
      (freight) =>
        freight.status === "DISPONIVEL" &&
        !freight.transportador_id,
    )
    .slice(0, 3);

  const earnings = completed.reduce(
    (sum, freight) => sum + Number(freight.valor_frete ?? 0),
    0,
  );

  const firstName = user?.name?.split(" ")[0] || "Transportador";

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {token === "dev" && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            Modo de demonstração — indicadores calculados com fretes fictícios.
          </p>
        )}

        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#39752b]">
              Painel do transportador
            </p>

            <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold sm:text-4xl">
              Bom dia, {firstName}!
            </h1>

            <p className="mt-2 text-sm text-[#708077]">
              Acompanhe seus transportes e descubra novas oportunidades.
            </p>
          </div>

          <Link
            to="/transportador/fretes-disponiveis"
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#c1f23c] px-5 py-3 text-sm font-extrabold hover:bg-[#d2f66d]"
          >
            Encontrar fretes
            <ArrowRight size={17} />
          </Link>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Fretes ativos"
            value={loading ? "—" : String(active.length)}
            description="Fretes aceitos ou em transporte"
            icon={Truck}
            featured
          />

          <MetricCard
            label="Fretes concluídos"
            value={loading ? "—" : String(completed.length)}
            description="Entregas confirmadas"
            icon={CircleCheck}
          />

          <MetricCard
            label="Ganhos registrados"
            value={loading ? "—" : money(earnings)}
            description="Valores dos fretes entregues"
            icon={FileText}
          />

          <MetricCard
            label="Avaliação média"
            value="—"
            description="Avaliações ainda não disponíveis no banco"
            icon={Star}
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <article className="rounded-2xl border border-[#e0e6dc] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#708077]">
                  Acompanhe sua entrega
                </p>

                <h2 className="mt-2 font-['Bricolage_Grotesque'] text-xl font-extrabold">
                  Fretes em andamento
                </h2>
              </div>

              <Link
                to="/transportador/meus-fretes"
                className="text-sm font-extrabold text-[#2f681f] hover:underline"
              >
                Ver meus fretes →
              </Link>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-[#718075]">
                Carregando...
              </p>
            ) : active.length === 0 ? (
              <div className="mt-6 rounded-xl bg-[#f7f8f3] p-8 text-center">
                <Truck
                  className="mx-auto text-[#78916e]"
                  size={28}
                />

                <p className="mt-3 text-sm font-bold">
                  Você não tem fretes em andamento.
                </p>

                <Link
                  to="/transportador/fretes-disponiveis"
                  className="mt-3 inline-block text-sm font-extrabold text-[#2f681f]"
                >
                  Procurar fretes
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {active.slice(0, 3).map((freight) => (
                  <div
                    key={freight.id}
                    className="rounded-xl border border-[#e0e6dc] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs font-extrabold text-[#65815b]">
                        {freight.codigo}
                      </span>

                      <span className="rounded-full bg-[#eaf5e3] px-3 py-1 text-xs font-bold text-[#2f681f]">
                        {freight.status === "EM_ROTA"
                          ? "Em trânsito"
                          : "Aguardando início"}
                      </span>
                    </div>

                    <p className="mt-3 font-extrabold">
                      {freight.pedido?.oferta?.produto ||
                        "Transporte de carga"}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#718075]">
                      <MapPin size={15} />
                      {freight.endereco_origem}
                      <span>→</span>
                      {freight.endereco_destino}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0e9] pt-3">
                      <p className="text-sm text-[#718075]">
                        {Number(freight.peso_toneladas).toLocaleString("pt-BR")} t
                      </p>

                      <p className="text-sm font-extrabold text-[#2f681f]">
                        {freight.valor_frete == null
                          ? "A confirmar"
                          : money(Number(freight.valor_frete))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/transportador/meus-fretes"
              className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#2f681f]"
            >
              Acompanhar transportes
              <ArrowRight size={16} />
            </Link>
          </article>

          <aside className="rounded-2xl bg-[#193c22] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                  Oportunidades para você
                </p>

                <h2 className="mt-2 font-['Bricolage_Grotesque'] text-xl font-extrabold">
                  Novos fretes disponíveis
                </h2>
              </div>

              <Truck size={24} className="text-[#c1f23c]" />
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-white/70">
                Carregando...
              </p>
            ) : available.length === 0 ? (
              <p className="mt-6 rounded-xl bg-white/10 p-4 text-sm text-white/75">
                Nenhum frete disponível no momento.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {available.map((freight) => (
                  <div
                    key={freight.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs font-bold text-[#c1f23c]">
                      {freight.codigo}
                    </p>

                    <p className="mt-2 text-sm font-extrabold">
                      {freight.endereco_origem}
                      {" → "}
                      {freight.endereco_destino}
                    </p>

                    <p className="mt-2 text-xs text-white/60">
                      {Number(freight.peso_toneladas).toLocaleString("pt-BR")} toneladas
                    </p>

                    <p className="mt-2 text-sm font-extrabold">
                      {freight.valor_frete == null
                        ? "Valor a confirmar"
                        : money(Number(freight.valor_frete))}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/transportador/fretes-disponiveis"
              className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#c1f23c]"
            >
              Ver todos os fretes
              <ArrowRight size={16} />
            </Link>
          </aside>
        </section>

        <section className="rounded-2xl border border-[#e0e6dc] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3dc] text-[#2f681f]">
              <CircleCheck size={19} />
            </span>

            <div>
              <h2 className="font-extrabold">
                Resumo da sua atividade
              </h2>

              <p className="mt-1 text-sm text-[#718075]">
                Indicadores calculados a partir dos fretes da sua conta.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <span>
              <b>{active.length}</b> frete(s) ativo(s)
            </span>

            <span>
              <b>{completed.length}</b> entrega(s) concluída(s)
            </span>

            <span>
              <b>
                {
                  freights.filter(
                    (freight) =>
                      freight.status === "DISPONIVEL" &&
                      !freight.transportador_id,
                  ).length
                }
              </b>{" "}
              oportunidade(s) disponíveis
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}