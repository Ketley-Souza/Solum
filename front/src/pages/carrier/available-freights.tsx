import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  Truck,
  X,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import {
  transportService,
  type Freight,
  type Vehicle,
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

function weight(value: number | string) {
  return Number(value).toLocaleString("pt-BR");
}

function date(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

export default function AvailableFreightsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isDemo = token === "dev";

  const [freights, setFreights] = useState<Freight[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [cargo, setCargo] = useState("Todas as cargas");
  const [selected, setSelected] = useState<Freight | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [freightData, vehicleData] = await Promise.all([
        transportService.listFreights("DISPONIVEL"),
        transportService.listVehicles(),
      ]);

      setFreights(
        freightData.filter(
          (freight) =>
            freight.status === "DISPONIVEL" &&
            !freight.transportador_id,
        ),
      );
      setVehicles(vehicleData);
    } catch (err) {
      setFreights([]);
      setVehicles([]);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os fretes.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          freights
            .map((freight) => freight.pedido?.oferta?.categoria)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [freights],
  );

  const filtered = useMemo(() => {
    return freights.filter((freight) => {
      const content = [
        freight.codigo,
        freight.endereco_origem,
        freight.endereco_destino,
        freight.pedido?.oferta?.produto,
        freight.pedido?.oferta?.categoria,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = content.includes(search.toLowerCase());

      const matchesCargo =
        cargo === "Todas as cargas" ||
        freight.pedido?.oferta?.categoria === cargo;

      return matchesSearch && matchesCargo;
    });
  }, [freights, search, cargo]);

  const compatibleVehicles = selected
    ? vehicles.filter(
        (vehicle) =>
          Number(vehicle.capacidade_toneladas) >=
          Number(selected.peso_toneladas),
      )
    : [];

  async function acceptFreight() {
    if (!selected || !vehicleId) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      await transportService.acceptFreight(selected.id, vehicleId);

      setSelected(null);
      setVehicleId("");
      setMessage("Frete aceito com sucesso! Veja em Meus fretes.");

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível aceitar o frete.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-12">
        {isDemo && (
          <p className="mb-5 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-800">
            Modo de demonstração — os fretes desta tela são fictícios.
          </p>
        )}

        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Oportunidades de transporte
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Fretes disponíveis
            </h1>
            <p className="mt-2 text-sm text-[#66736a]">
              Encontre cargas que combinam com sua frota.
            </p>
          </div>

          <span className="rounded-xl bg-[#eaf5e3] px-4 py-3 text-sm font-bold text-[#2f681f]">
            {filtered.length} frete(s) disponível(is)
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#e5e9e1] bg-white p-4 md:flex-row">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-[#e1e6de] px-3 py-3">
            <Search size={18} className="text-[#718075]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por carga, origem ou destino"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-[#e1e6de] px-3 py-3">
            <SlidersHorizontal size={18} className="text-[#718075]" />

            <select
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
              className="bg-transparent text-sm outline-none"
            >
              <option>Todas as cargas</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <button
            onClick={() => void load()}
            className="rounded-xl border border-[#dfe6da] px-5 py-3 text-sm font-bold hover:bg-[#f4f8ef]"
          >
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

        {loading ? (
          <p className="mt-8 text-center text-sm text-[#718075]">
            Carregando fretes...
          </p>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white p-10 text-center">
            <Truck
              size={32}
              className="mx-auto text-[#719166]"
            />
            <h2 className="mt-3 font-bold">
              Nenhum frete disponível
            </h2>
            <p className="mt-2 text-sm text-[#718075]">
              Tente atualizar ou modificar os filtros.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filtered.map((freight) => (
              <article
                key={freight.id}
                className="rounded-2xl border border-[#e4e9e1] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold text-[#65815b]">
                      {freight.codigo}
                    </span>

                    <h2 className="mt-2 text-lg font-extrabold">
                      {freight.pedido?.oferta?.produto ||
                        "Carga agrícola"}
                    </h2>

                    <p className="mt-1 text-sm text-[#718075]">
                      {weight(freight.peso_toneladas)} toneladas
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eaf5e3] px-3 py-1 text-xs font-extrabold text-[#2f681f]">
                    Disponível
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#f4f8ef] p-4">
                    <p className="text-xs text-[#718075]">Origem</p>
                    <p className="mt-2 flex items-start gap-2 text-sm font-bold">
                      <MapPin size={17} className="shrink-0 text-[#46723a]" />
                      {freight.endereco_origem}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#f4f8ef] p-4">
                    <p className="text-xs text-[#718075]">Destino</p>
                    <p className="mt-2 flex items-start gap-2 text-sm font-bold">
                      <MapPin size={17} className="shrink-0 text-[#46723a]" />
                      {freight.endereco_destino}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#edf0e9] pt-4">
                  <div>
                    <p className="text-xs text-[#718075]">
                      Valor do frete
                    </p>
                    <p className="mt-1 text-xl font-extrabold text-[#2f681f]">
                      {money(freight.valor_frete)}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#718075]">
                      <CalendarDays size={14} />
                      Publicado em {date(freight.criado_em)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelected(freight);
                      setVehicleId("");
                      setError("");
                    }}
                    className="rounded-xl bg-[#c1f23c] px-5 py-3 text-sm font-extrabold hover:bg-[#d2f66d]"
                  >
                    Ver detalhes e aceitar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="accept-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="accept-title" className="text-xl font-extrabold">
                Aceitar frete {selected.codigo}
              </h2>

              <button
                onClick={() => setSelected(null)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <p><b>Origem:</b> {selected.endereco_origem}</p>
              <p><b>Destino:</b> {selected.endereco_destino}</p>
              <p><b>Peso:</b> {weight(selected.peso_toneladas)} t</p>
              <p><b>Valor:</b> {money(selected.valor_frete)}</p>
            </div>

            <label className="mt-6 block text-sm font-bold">
              Selecione o veículo

              <select
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dfe6da] p-3 font-normal"
              >
                <option value="">Escolha um veículo</option>

                {compatibleVehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.tipo_veiculo} —{" "}
                    {weight(vehicle.capacidade_toneladas)} t
                  </option>
                ))}
              </select>
            </label>

            <VehicleForm onCreated={() => void load()} />

            {compatibleVehicles.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                Você não possui um veículo compatível com esta carga.
              </p>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border px-4 py-3 text-sm font-bold"
              >
                Cancelar
              </button>

              <button
                disabled={!vehicleId || busy}
                onClick={() => void acceptFreight()}
                className="rounded-xl bg-[#2f681f] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {busy ? "Aceitando..." : "Confirmar aceite"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

const vehicleTypes = ["VUC", "TOCO", "TRUCK", "CARRETA", "BITREM", "RODOTREM"];

/** Cadastro de veiculo na frota do transportador (grava no banco). */
function VehicleForm({ onCreated }: { onCreated: () => void }) {
  const [type, setType] = useState("TRUCK");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save() {
    setSaving(true);
    setFeedback("");
    try {
      await transportService.createVehicle(type, Number(capacity.replace(",", ".")));
      setCapacity("");
      setFeedback("Ve\u00edculo cadastrado.");
      onCreated();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "N\u00e3o foi poss\u00edvel cadastrar o ve\u00edculo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[#dfe6da] bg-[#f4f8ef] p-4">
      <p className="text-sm font-bold">{"Cadastrar novo ve\u00edculo"}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-[#dfe6da] bg-white p-2.5 text-sm"
        >
          {vehicleTypes.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          inputMode="decimal"
          placeholder="Capacidade (t)"
          className="w-36 rounded-xl border border-[#dfe6da] bg-white p-2.5 text-sm"
        />
        <button
          type="button"
          disabled={saving || !(Number(capacity.replace(",", ".")) > 0)}
          onClick={() => void save()}
          className="rounded-xl bg-[#2f681f] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Cadastrar"}
        </button>
      </div>
      {feedback && <p className="mt-2 text-xs font-semibold text-[#2f681f]">{feedback}</p>}
    </div>
  );
}
