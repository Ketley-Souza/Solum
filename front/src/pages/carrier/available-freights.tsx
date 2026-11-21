
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Search,
  Truck,
  X,
} from "lucide-react";

import ProfileNavbar from "../../components/ProfileNavbar";
import { requestJson } from "../../services/http";
import { type Freight, type Vehicle } from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectAvailableFreights,
  selectFreightsError,
  selectFreightsLoading,
  selectVehicles,
  useFreightStore,
} from "../../stores/freightStore";

const LINKS = [
  { label: "Visão geral", href: "/transportador" },
  { label: "Fretes disponíveis", href: "/transportador/fretes-disponiveis" },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];

const FILTERS = ["Todos", "Bitrem", "Carreta", "Toco", "Truck"];
const VEHICLE_TYPES = ["VUC", "TOCO", "TRUCK", "CARRETA", "BITREM", "RODOTREM"];

const ACCENTS = [
  "bg-[#214c2f]",
  "bg-[#1e4c2f]",
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

export default function AvailableFreightsPage() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const dialogRef = useRef<HTMLElement>(null);
  const busyRef = useRef(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const freights = useFreightStore(useShallow(selectAvailableFreights));
  const vehicles = useFreightStore(selectVehicles);
  const loading = useFreightStore(selectFreightsLoading);
  const storeError = useFreightStore(selectFreightsError);
  const vehiclesError = useFreightStore((state) => state.vehicles.error);

  const fetchFreights = useFreightStore((state) => state.fetchFreights);
  const fetchVehicles = useFreightStore((state) => state.fetchVehicles);
  const acceptFreightFromStore = useFreightStore(
    (state) => state.acceptFreight,
  );

  const [search, setSearch] = useState("");
  const [cargo, setCargo] = useState("Todas as cargas");
  const [vehicleFilter, setVehicleFilter] = useState("Todos");
  const [showSearch, setShowSearch] = useState(false);
  const [fleetOpen, setFleetOpen] = useState(false);

  const [selected, setSelected] = useState<Freight | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [fleetMessage, setFleetMessage] = useState("");
  const [fleetBusyId, setFleetBusyId] = useState<string | null>(null);

  const displayError = error || storeError;

  // Carrega fretes e veículos, evitando reutilizar listas filtradas em cache.
  const load = useCallback(async () => {
    await Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  }, [fetchFreights, fetchVehicles]);

  useEffect(() => {
    void load();

    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };

    const interval = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  // Abre a seção da frota quando acessada pela âncora #frota.
  useEffect(() => {
    if (window.location.hash !== "#frota") return;

    setFleetOpen(true);

    window.setTimeout(
      () =>
        document.getElementById("frota")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      60,
    );
  }, []);

  // Controle de foco e teclado do modal.
  useEffect(() => {
    if (!selected) return;

    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>("select")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        closeModal();
      }

      if (event.key !== "Tab" || !dialog) return;

      const elements = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (!first || !last) return;

      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [selected]);

  // Categorias disponíveis para o filtro.
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

  // Filtragem por pesquisa e categoria.
  const filtered = useMemo(
    () =>
      freights.filter((freight) => {
        const content = [
          freight.codigo,
          freight.endereco_origem,
          freight.endereco_destino,
          freight.pedido?.oferta?.produto,
          freight.pedido?.oferta?.categoria,
        ]
          .join(" ")
          .toLowerCase();

        return (
          content.includes(search.toLowerCase()) &&
          (cargo === "Todas as cargas" ||
            freight.pedido?.oferta?.categoria === cargo)
        );
      }),
    [freights, search, cargo],
  );

  // Compatibilidade entre capacidade do veículo e peso da carga.
  const displayedFreights = useMemo(
    () =>
      filtered.filter(
        (freight) =>
          vehicleFilter === "Todos" ||
          vehicles.some(
            (vehicle) =>
              vehicle.tipo_veiculo.toUpperCase() ===
                vehicleFilter.toUpperCase() &&
              Number(vehicle.capacidade_toneladas) >=
                Number(freight.peso_toneladas),
          ),
      ),
    [filtered, vehicles, vehicleFilter],
  );

  const compatibleVehicles = selected
    ? vehicles.filter(
        (vehicle) =>
          Number(vehicle.capacidade_toneladas) >=
          Number(selected.peso_toneladas),
      )
    : [];

  function closeModal() {
    if (busyRef.current) return;

    setSelected(null);
    setVehicleId("");
    setError("");
  }

  function openModal(freight: Freight, trigger: HTMLElement) {
    returnFocusRef.current = trigger;
    setSelected(freight);
    setVehicleId("");
    setError("");
    setMessage("");
  }

  async function deactivateVehicle(vehicle: Vehicle) {
    const confirmed = window.confirm(
      `Desativar o veículo ${vehicle.tipo_veiculo} (${weight(vehicle.capacidade_toneladas)} t)?`,
    );

    if (!token || !confirmed) return;

    setFleetBusyId(vehicle.id);
    setError("");
    setFleetMessage("");

    try {
      await requestJson<void>(
        `/veiculos/${encodeURIComponent(vehicle.id)}/desativar`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (vehicleId === vehicle.id) setVehicleId("");

      await fetchVehicles(true);
      setFleetMessage("Veículo desativado com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível desativar o veículo.",
      );
    } finally {
      setFleetBusyId(null);
    }
  }

  async function acceptFreight() {
    if (!selected || !vehicleId || busyRef.current) return;

    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await acceptFreightFromStore(selected.id, vehicleId);

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
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#142418]">
      <ProfileNavbar
        profileName={user?.name || "Transportador"}
        role="TRANSPORTADOR"
        links={LINKS}
        notificationsHref="/transportador/notificacoes"
      />

      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 md:px-12">
        {/* Cabeçalho */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-[28px]">
              Fretes disponíveis
            </h1>
            <p className="mt-1 text-xs text-[#879185]">
              Encontre cargas que combinam com a capacidade da sua frota.
            </p>
          </div>

          <Link
            to="/transportador/meus-fretes"
            className="inline-flex items-center gap-2 rounded-xl bg-[#baf332] px-5 py-3 text-xs font-bold text-black transition hover:bg-[#d0f57a]"
          >
            Meus fretes <ArrowRight size={16} />
          </Link>
        </header>

        {/* Filtros e ações */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filtrar por tipo de veículo compatível"
          >
            {FILTERS.map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={vehicleFilter === type}
                onClick={() => setVehicleFilter(type)}
                className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${
                  vehicleFilter === type
                    ? "border-[#17351f] bg-[#17351f] text-white"
                    : "border-[#e0e7da] bg-white text-[#4f6150] hover:bg-[#eaf4df]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearch((value) => !value)}
              aria-expanded={showSearch}
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold text-[#355437] hover:bg-[#f2f8eb]"
            >
              <Search size={14} /> Buscar
            </button>

            <button
              type="button"
              onClick={() => setFleetOpen((value) => !value)}
              aria-expanded={fleetOpen}
              aria-controls="frota"
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold text-[#355437] hover:bg-[#f2f8eb]"
            >
              <Truck size={15} /> Minha frota
              <ChevronDown size={14} />
            </button>

            <button
              type="button"
              onClick={() => void load()}
              className="rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold hover:bg-[#f2f8eb]"
            >
              Atualizar
            </button>
          </div>
        </div>

        {vehicleFilter !== "Todos" && (
          <p className="mt-2 text-[11px] text-[#7d897b]">
            Exibindo cargas compatíveis com veículos {vehicleFilter} cadastrados
            na sua frota.
          </p>
        )}

        {/* Pesquisa */}
        {showSearch && (
          <div className="mt-3 flex flex-wrap gap-3 rounded-xl border border-[#e2eadb] bg-white p-3">
            <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#e0e7da] px-3 py-2">
              <Search size={16} className="text-[#81907e]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por carga, origem ou destino"
                className="min-w-[200px] flex-1 bg-transparent text-xs outline-none"
              />
            </label>

            <select
              aria-label="Filtrar categoria"
              value={cargo}
              onChange={(event) => setCargo(event.target.value)}
              className="rounded-lg border border-[#e0e7da] bg-white px-3 py-2 text-xs"
            >
              <option>Todas as cargas</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        )}

        {/* Feedbacks */}
        {displayError && (
          <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">
            {displayError}
          </p>
        )}

        {message && (
          <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800">
            {message}
          </p>
        )}

        {vehiclesError && (
          <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            Não foi possível carregar a frota: {vehiclesError}
          </p>
        )}

        {vehicles.length === 0 && !vehiclesError && (
          <button
            type="button"
            onClick={() => setFleetOpen(true)}
            className="mt-3 block w-full rounded-xl border border-[#dce6b6] bg-[#eff7dd] px-4 py-3 text-left text-xs text-[#355e25]"
          >
            <b>Você ainda não tem veículos cadastrados.</b> Clique aqui para
            cadastrar um antes de aceitar um frete.
          </button>
        )}

        {/* Lista de fretes */}
        <section
          className="mt-4 space-y-3"
          aria-label="Lista de fretes disponíveis"
        >
          {loading && displayedFreights.length === 0 ? (
            <p className="rounded-xl bg-white p-8 text-center text-xs text-[#82917e]">
              Carregando fretes...
            </p>
          ) : displayedFreights.length === 0 ? (
            <div className="rounded-2xl border border-[#e0e7d9] bg-white p-9 text-center">
              <Truck size={28} className="mx-auto text-[#719266]" />
              <p className="mt-3 text-sm font-bold">Nenhum frete encontrado</p>
              <p className="mt-1 text-xs text-[#788778]">
                Ajuste os filtros, cadastre um veículo compatível ou atualize a
                lista.
              </p>
            </div>
          ) : (
            displayedFreights.map((freight, index) => (
              <article
                key={freight.id}
                className="relative flex min-h-[100px] flex-col gap-3 rounded-2xl border border-[#e0e6dc] bg-white px-5 py-4 shadow-[0_4px_14px_rgba(22,48,25,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                {/* Traço colorido lateral */}
                <span
                  aria-hidden="true"
                  className={`absolute -left-[3px] top-5 bottom-5 w-[5px] rounded-full ${ACCENTS[index % ACCENTS.length]}`}
                />

                {/* Origem e destino */}
                <div className="min-w-0 py-2">
                  <h2 className="flex flex-wrap items-center gap-2 text-sm font-extrabold leading-snug">
                    <span>{freight.endereco_origem}</span>
                    <MapPin
                      size={15}
                      strokeWidth={2.2}
                      className="shrink-0 text-[#719266]"
                      aria-hidden="true"
                    />
                    <span>{freight.endereco_destino}</span>
                  </h2>

                  <p className="mt-2 text-[11px] text-[#79867a]">
                    {freight.pedido?.oferta?.produto || "Carga agrícola"} ·{" "}
                    {weight(freight.peso_toneladas)} ton ·{" "}
                    {freight.pedido?.oferta?.categoria || "Carga"} · Código{" "}
                    {freight.codigo}
                  </p>
                </div>

                {/* Valor e aceite */}
                <div className="flex shrink-0 items-center justify-between gap-4 sm:pl-4">
                  <div className="text-right">
                    <p className="font-['Bricolage_Grotesque'] text-xl font-extrabold text-[#1e3b21]">
                      {money(freight.valor_frete)}
                    </p>
                    <p className="text-[10px] text-[#91a08c]">
                      {freight.valor_frete == null
                        ? "Valor não informado"
                        : "Valor registrado"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) =>
                      openModal(freight, event.currentTarget)
                    }
                    className="rounded-xl bg-[#285e22] px-5 py-3 text-xs font-extrabold text-white transition hover:bg-[#2e4e2b]"
                  >
                    Aceitar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <p className="mt-3 text-[11px] text-[#7f8c7c]" role="status">
          {displayedFreights.length} frete(s) encontrado(s) · lista atualizada
          automaticamente a cada 60 segundos com a aba visível.
        </p>

        {/* Gerenciamento da frota */}
        {fleetOpen && (
          <section
            id="frota"
            className="mt-5 scroll-mt-6 rounded-2xl border border-[#dfe7d8] bg-white p-5"
            aria-label="Minha frota"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-['Bricolage_Grotesque'] text-lg font-extrabold">
                  Minha frota
                </h2>
                <p className="mt-1 text-xs text-[#788779]">
                  Gerencie seus veículos e a capacidade de carga.
                </p>
              </div>

              <span className="rounded-full bg-[#edf5e6] px-3 py-1 text-xs font-bold text-[#336b30]">
                {vehicles.length} veículo(s)
              </span>
            </div>

            {vehicles.length === 0 ? (
              <p className="mt-4 rounded-xl bg-[#f5f8ed] p-3 text-xs">
                Nenhum veículo cadastrado.
              </p>
            ) : (
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-[#e2eadb] p-3"
                  >
                    <span className="text-xs">
                      <b>{vehicle.tipo_veiculo}</b>
                      <span className="block text-[#819081]">
                        Capacidade: {weight(vehicle.capacidade_toneladas)} toneladas
                      </span>
                    </span>

                    <button
                      type="button"
                      disabled={fleetBusyId !== null || busy}
                      onClick={() => void deactivateVehicle(vehicle)}
                      className="rounded-lg border border-[#e0e6d9] px-3 py-2 text-[11px] font-bold hover:bg-red-50 disabled:opacity-50"
                    >
                      {fleetBusyId === vehicle.id ? "Desativando..." : "Desativar"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <VehicleForm
              onCreated={(vehicle) => {
                setFleetMessage(
                  `Veículo ${vehicle.tipo_veiculo} cadastrado (${weight(vehicle.capacidade_toneladas)} t).`,
                );
                setError("");
              }}
            />

            {fleetMessage && (
              <p role="status" className="mt-3 text-xs font-bold text-[#2c7735]">
                {fleetMessage}
              </p>
            )}
          </section>
        )}
      </main>

      {/* Modal de aceite */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="accept-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <h2 id="accept-title" className="text-xl font-extrabold">
                Aceitar frete {selected.codigo}
              </h2>

              <button
                type="button"
                disabled={busy}
                onClick={closeModal}
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

                {vehicles.map((vehicle) => {
                  const compatible =
                    Number(vehicle.capacidade_toneladas) >=
                    Number(selected.peso_toneladas);

                  return (
                    <option
                      key={vehicle.id}
                      value={vehicle.id}
                      disabled={!compatible}
                    >
                      {vehicle.tipo_veiculo} — {weight(vehicle.capacidade_toneladas)} t
                      {!compatible ? " (capacidade insuficiente)" : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            <p className="mt-2 text-xs text-[#718075]">
              O veículo precisa suportar pelo menos{" "}
              {weight(selected.peso_toneladas)} toneladas. Os veículos
              incompatíveis aparecem desabilitados.
            </p>

            <VehicleForm
              onCreated={(vehicle) => {
                if (
                  Number(vehicle.capacidade_toneladas) >=
                  Number(selected.peso_toneladas)
                ) {
                  setVehicleId(vehicle.id);
                  setError("");
                } else {
                  setError(
                    `O veículo ${vehicle.tipo_veiculo} foi cadastrado, mas sua capacidade é insuficiente para este frete.`,
                  );
                }
              }}
            />

            {compatibleVehicles.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                Você não possui um veículo compatível com esta carga.
              </p>
            )}

            {displayError && (
              <p className="mt-3 text-sm text-red-700">{displayError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={closeModal}
                className="rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
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

// Cadastro de veículos na frota do transportador.
function VehicleForm({ onCreated }: { onCreated: (vehicle: Vehicle) => void }) {
  const createVehicle = useFreightStore((state) => state.createVehicle);

  const [type, setType] = useState("TRUCK");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save() {
    const value = Number(capacity.replace(",", "."));
    if (saving || !(value > 0)) return;

    setSaving(true);
    setFeedback("");

    try {
      const vehicle = await createVehicle(type, value);

      setCapacity("");
      setFeedback(
        `Veículo ${vehicle.tipo_veiculo} cadastrado (${weight(vehicle.capacidade_toneladas)} t).`,
      );
      onCreated(vehicle);
    } catch (err) {
      setFeedback(
        err instanceof Error
          ? err.message
          : "Não foi possível cadastrar o veículo.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-[#dfe6da] bg-[#f4f8ef] p-4">
      <p className="text-sm font-bold">Cadastrar novo veículo</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <select
          aria-label="Tipo do veículo"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-[#dfe6da] bg-white p-2.5 text-sm"
        >
          {VEHICLE_TYPES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <input
          type="number"
          id="vehicle-capacity-tonnes"
          name="vehicle_capacity_tonnes"
          aria-label="Capacidade do veículo em toneladas"
          autoComplete="off"
          min="0"
          step="any"
          inputMode="decimal"
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
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

      {feedback && (
        <p role="status" className="mt-2 text-xs font-semibold text-[#2f681f]">
          {feedback}
        </p>
      )}
    </div>
  );
}
