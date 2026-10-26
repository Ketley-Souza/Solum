import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  RefreshCw,
  Search,
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
  if (value == null) return "A confirmar";

  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function CarrierHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const [freights, setFreights] = useState<Freight[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const allFreights = await transportService.listFreights("ENTREGUE");

      setFreights(
        allFreights.filter(
          (freight) =>
            freight.transportador_id === user?.id &&
            freight.status === "ENTREGUE",
        ),
      );
    } catch (err) {
      setFreights([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o histórico.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();

    return freights.filter((freight) => {
      const content = [
        freight.codigo,
        freight.endereco_origem,
        freight.endereco_destino,
        freight.pedido?.oferta?.produto,
      ]
        .join(" ")
        .toLowerCase();

      return content.includes(term);
    });
  }, [freights, search]);

  const total = freights.reduce(
    (sum, freight) => sum + Number(freight.valor_frete ?? 0),
    0,
  );

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
            Modo de demonstração — histórico fictício.
          </p>
        )}

        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Seu desempenho
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Histórico de fretes
            </h1>

            <p className="mt-2 text-sm text-[#66736a]">
              Consulte os transportes concluídos e os valores recebidos.
            </p>
          </div>

          <button
            onClick={() => void load()}
            className="flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-4 py-3 text-sm font-bold"
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

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e4e9e1] bg-white p-5">
            <p className="text-sm text-[#718075]">
              Fretes concluídos
            </p>

            <p className="mt-2 text-3xl font-extrabold">
              {loading ? "—" : freights.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4e9e1] bg-white p-5">
            <p className="text-sm text-[#718075]">
              Valor total dos fretes concluídos
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#2f681f]">
              {loading ? "—" : money(total)}
            </p>
          </div>
        </div>

        <label className="mt-7 flex items-center gap-3 rounded-xl border border-[#e1e6de] bg-white px-4 py-3">
          <Search size={18} className="text-[#718075]" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código, carga ou cidade"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        {loading ? (
          <p className="mt-8 text-center text-sm text-[#718075]">
            Carregando histórico...
          </p>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-white p-10 text-center">
            <CheckCircle2
              size={32}
              className="mx-auto text-[#719166]"
            />

            <h2 className="mt-3 font-extrabold">
              Nenhuma entrega encontrada.
            </h2>

            <p className="mt-2 text-sm text-[#718075]">
              Quando você confirmar uma entrega, ela aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[#e4e9e1] bg-white">
            {filtered.map((freight, index) => (
              <article
                key={freight.id}
                className={`flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${
                  index > 0 ? "border-t border-[#edf0e9]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-[#eaf5e3] p-3 text-[#2f681f]">
                    <CheckCircle2 size={21} />
                  </span>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold">
                        {freight.codigo}
                      </h3>

                      <span className="rounded-full bg-[#eaf5e3] px-3 py-1 text-xs font-extrabold text-[#2f681f]">
                        Entregue
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold">
                      {freight.pedido?.oferta?.produto ||
                        "Carga agrícola"}
                    </p>

                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#718075]">
                      <MapPin size={15} />
                      {freight.endereco_origem}
                      <span>→</span>
                      {freight.endereco_destino}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#718075]">
                      Data registrada
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {new Date(
                        freight.atualizado_em,
                      ).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#718075]">
                      Valor do frete
                    </p>

                    <p className="mt-1 text-sm font-extrabold text-[#2f681f]">
                      {money(freight.valor_frete)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}