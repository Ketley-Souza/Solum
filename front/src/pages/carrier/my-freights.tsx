import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Navigation,
  RefreshCw,
  Truck,
} from "lucide-react";
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

function money(value: number | string | null) {
  return value == null
    ? "A confirmar"
    : Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
}

function statusLabel(status: Freight["status"]) {
  switch (status) {
    case "ACEITO":
      return "Aguardando início";
    case "EM_ROTA":
      return "Em trânsito";
    case "ENTREGUE":
      return "Entregue";
    default:
      return status;
  }
}

export default function MyFreightsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [freights, setFreights] = useState<Freight[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const allFreights = await transportService.listFreights();

      setFreights(
        allFreights.filter(
          (freight) =>
            freight.transportador_id === user?.id &&
            (freight.status === "ACEITO" ||
              freight.status === "EM_ROTA"),
        ),
      );
    } catch (err) {
      setFreights([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar seus fretes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  async function advance(freight: Freight) {
    setBusy(freight.id);
    setError("");
    setMessage("");

    try {
      if (freight.status === "ACEITO") {
        await transportService.startTransport(freight.id);
        setMessage("Transporte iniciado com sucesso!");
      } else if (freight.status === "EM_ROTA") {
        await transportService.confirmDelivery(freight.id);
        setMessage(
          "Entrega confirmada! O frete foi enviado para o histórico.",
        );
      }

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível atualizar o frete.",
      );
    } finally {
      setBusy(null);
    }
  }

  const accepted = freights.filter(
    (freight) => freight.status === "ACEITO",
  ).length;

  const inTransit = freights.filter(
    (freight) => freight.status === "EM_ROTA",
  ).length;

  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-12">
        {token === "dev" && (
          <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            Modo de demonstração — nenhuma alteração é enviada ao banco.
          </p>
        )}

        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Acompanhamento
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Meus fretes
            </h1>

            <p className="mt-2 text-sm text-[#66736a]">
              Acompanhe suas cargas e atualize o andamento das entregas.
            </p>
          </div>

          <button
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-4 py-3 text-sm font-bold hover:bg-[#f4f8ef]"
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800"
          >
            {message}
          </p>
        )}

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Fretes ativos", value: freights.length },
            { label: "Aguardando início", value: accepted },
            { label: "Em trânsito", value: inTransit },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-[#e4e9e1] bg-white p-5"
            >
              <p className="text-sm text-[#718075]">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold">
                {loading ? "—" : metric.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-center text-sm text-[#718075]">
            Carregando seus fretes...
          </p>
        ) : freights.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center">
            <Truck
              size={32}
              className="mx-auto text-[#719166]"
            />
            <h2 className="mt-3 font-extrabold">
              Você não possui fretes ativos.
            </h2>
            <p className="mt-2 text-sm text-[#718075]">
              Ao aceitar um frete, ele aparecerá nesta página.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {freights.map((freight) => (
              <article
                key={freight.id}
                className="rounded-2xl border border-[#e4e9e1] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-extrabold text-[#65815b]">
                      {freight.codigo}
                    </span>

                    <h2 className="mt-2 text-lg font-extrabold">
                      {freight.pedido?.oferta?.produto ||
                        "Transporte de carga"}
                    </h2>

                    <p className="mt-1 text-sm text-[#718075]">
                      {Number(freight.peso_toneladas).toLocaleString("pt-BR")} toneladas
                      {" · "}
                      {money(freight.valor_frete)}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf5e3] px-3 py-2 text-xs font-extrabold text-[#2f681f]">
                    {statusLabel(freight.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 rounded-xl bg-[#f4f8ef] p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="flex items-start gap-3">
                    <MapPin size={19} className="shrink-0 text-[#46723a]" />
                    <div>
                      <p className="text-xs text-[#718075]">
                        Origem
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {freight.endereco_origem}
                      </p>
                    </div>
                  </div>

                  <Navigation
                    size={19}
                    className="hidden text-[#7e9277] md:block"
                  />

                  <div className="flex items-start gap-3">
                    <MapPin size={19} className="shrink-0 text-[#46723a]" />
                    <div>
                      <p className="text-xs text-[#718075]">
                        Destino
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        {freight.endereco_destino}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#edf0e9] pt-4">
                  <span className="flex items-center gap-2 text-sm text-[#718075]">
                    <CalendarDays size={16} />
                    {new Date(freight.criado_em).toLocaleDateString("pt-BR")}
                  </span>

                  <button
                    disabled={busy === freight.id}
                    onClick={() => void advance(freight)}
                    className="rounded-xl bg-[#2f681f] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#245518] disabled:opacity-50"
                  >
                    {busy === freight.id
                      ? "Atualizando..."
                      : freight.status === "ACEITO"
                        ? "Iniciar transporte"
                        : "Confirmar entrega"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}