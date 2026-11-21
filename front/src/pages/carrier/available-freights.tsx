
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  Truck,
  X,
  ChevronDown,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import { requestJson } from "../../services/http";
import {
  type Freight,
  type Vehicle,
} from "../../services/transportService";
import { useAuthStore } from "../../stores/authStore";
import {
  selectAvailableFreights,
  selectFreightsError,
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
  const acceptFreightFromStore = useFreightStore((state) => state.acceptFreight);
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("Todos");
  const [fleetOpen, setFleetOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [cargo, setCargo] = useState("Todas as cargas");
  const [selected, setSelected] = useState<Freight | null>(null);
  const [vehicleId, setVehicleId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fleetMessage, setFleetMessage] = useState("");
  const [fleetBusyId, setFleetBusyId] = useState<string | null>(null);
  const displayError = error || storeError;

  const load = useCallback(async () => {
    // Todas as páginas carregam a lista completa para não reutilizar cache filtrado.
    await Promise.all([fetchFreights(undefined, true), fetchVehicles(true)]);
  }, [fetchFreights, fetchVehicles]);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 60_000);
    const refreshVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", refreshVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [load]);

  useEffect(() => {
    if (window.location.hash === "#frota") {
      setFleetOpen(true);
      window.setTimeout(() => document.getElementById("frota")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }, []);

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
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]',
      )).filter((element) => element.getClientRects().length > 0);
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) return;
      if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
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

  function closeModal() {
    if (busy) return;
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
    if (!token || !window.confirm(`Desativar o veículo ${vehicle.tipo_veiculo} (${weight(vehicle.capacidade_toneladas)} t)?`)) return;
    setFleetBusyId(vehicle.id);
    setError("");
    setFleetMessage("");
    try {
      await requestJson<void>(`/veiculos/${encodeURIComponent(vehicle.id)}/desativar`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (vehicleId === vehicle.id) setVehicleId("");
      await fetchVehicles(true);
      setFleetMessage("Veículo desativado com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível desativar o veículo.");
    } finally {
      setFleetBusyId(null);
    }
  }

  async function acceptFreight() {
    if (!selected || !vehicleId) return;

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

  // O backend não informa tipo de veículo exigido por frete. Os botões do
  // Figma filtram pela compatibilidade com veículos da frota cadastrada.
  const displayedFreights = filtered.filter((freight) =>
    vehicleFilter === "Todos" || vehicles.some((v) =>
      v.tipo_veiculo.toUpperCase() === vehicleFilter.toUpperCase() &&
      Number(v.capacidade_toneladas) >= Number(freight.peso_toneladas),
    ),
  );
  const filters = ["Todos", "Bitrem", "Carreta", "Toco", "Truck"];

  return (
    <div className="min-h-screen bg-[#f8f9f5] font-['Manrope'] text-[#142418]">
      <ProfileNavbar profileName={user?.name || "Transportador"} role="TRANSPORTADOR" links={links} notificationsHref="/transportador/notificacoes" />
      <main className="mx-auto max-w-[1280px] px-5 pb-16 pt-8 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#2e7839]">Conta transportador · {freights.length} fretes disponíveis</p>
            <h1 className="mt-1 font-['Bricolage_Grotesque'] text-[30px] font-extrabold tracking-tight md:text-[32px]">Fretes disponíveis</h1>
            <p className="mt-1 text-xs text-[#879185]">Encontre cargas que combinam com a capacidade da sua frota.</p>
          </div>
          <Link to="/transportador/meus-fretes" className="inline-flex items-center gap-2 rounded-xl bg-[#285e22] px-5 py-3 text-xs font-bold text-white hover:bg-[#347a2c]">Meus fretes <ArrowRight size={16} /></Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo de veículo compatível">
            {filters.map((type) => <button type="button" key={type} aria-pressed={vehicleFilter === type} onClick={() => setVehicleFilter(type)} className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${vehicleFilter === type ? "border-[#17351f] bg-[#17351f] text-white" : "border-[#e0e7da] bg-white text-[#4f6150] hover:bg-[#eaf4df]"}`}>{type}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setShowSearch((v) => !v)} aria-expanded={showSearch} className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold text-[#355437] hover:bg-[#f2f8eb]"><Search size={14} /> Buscar / filtrar</button>
            <button type="button" onClick={() => setFleetOpen((v) => !v)} aria-expanded={fleetOpen} aria-controls="frota" className="inline-flex items-center gap-2 rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold text-[#355437] hover:bg-[#f2f8eb]"><Truck size={15} /> Minha frota <ChevronDown size={14} /></button>
            <button type="button" onClick={() => void load()} className="rounded-xl border border-[#dfe6da] bg-white px-3 py-2 text-xs font-bold hover:bg-[#f2f8eb]">Atualizar</button>
          </div>
        </div>
        {vehicleFilter !== "Todos" && <p className="mt-2 text-[11px] text-[#7d897b]">Exibindo cargas compatíveis com veículos {vehicleFilter} cadastrados na sua frota.</p>}
        {showSearch && <div className="mt-3 flex flex-wrap gap-3 rounded-xl border border-[#e2eadb] bg-white p-3">
          <label className="flex flex-1 items-center gap-2 rounded-lg border border-[#e0e7da] px-3 py-2"><Search size={16} className="text-[#81907e]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por carga, origem ou destino" className="min-w-[200px] flex-1 bg-transparent text-xs outline-none" /></label>
          <select aria-label="Filtrar categoria" value={cargo} onChange={(e) => setCargo(e.target.value)} className="rounded-lg border border-[#e0e7da] bg-white px-3 py-2 text-xs"><option>Todas as cargas</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        </div>}

        {displayError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{displayError}</p>}
        {message && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-xs font-bold text-green-800">{message}</p>}
        {vehiclesError && <p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Não foi possível carregar a frota: {vehiclesError}</p>}
        {vehicles.length === 0 && !vehiclesError && <button type="button" onClick={() => setFleetOpen(true)} className="mt-3 block w-full rounded-xl border border-[#dce6b6] bg-[#eff7dd] px-4 py-3 text-left text-xs text-[#355e25]"><b>Você ainda não tem veículos cadastrados.</b> Clique aqui para cadastrar um antes de aceitar um frete.</button>}

        <section className="mt-4 space-y-3" aria-label="Lista de fretes disponíveis">
          {loading && displayedFreights.length === 0 ? <p className="rounded-xl bg-white p-8 text-center text-xs text-[#82917e]">Carregando fretes...</p> : displayedFreights.length === 0 ? (
            <div className="rounded-2xl border border-[#e0e7d9] bg-white p-9 text-center"><Truck size={28} className="mx-auto text-[#719266]"/><p className="mt-3 text-sm font-bold">Nenhum frete encontrado</p><p className="mt-1 text-xs text-[#788778]">Ajuste os filtros, cadastre um veículo compatível ou atualize a lista.</p></div>
          ) : displayedFreights.map((freight, i) => (
            <article key={freight.id} className="flex min-h-[100px] flex-col gap-3 rounded-2xl border border-[#e0e6dc] bg-white px-4 py-4 shadow-[0_4px_14px_rgba(22,48,25,0.05)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex min-w-0 items-stretch gap-4">
                <span aria-hidden="true" className={`w-[4px] shrink-0 rounded-full ${i % 4 === 0 ? "bg-[#e98113]" : i % 4 === 2 ? "bg-[#d64343]" : "bg-[#214c2f]"}`} />
                <div className="min-w-0 py-2"><h2 className="text-sm font-extrabold leading-snug">{freight.endereco_origem} → {freight.endereco_destino}</h2><p className="mt-2 text-[11px] text-[#79867a]">{freight.pedido?.oferta?.produto || "Carga agrícola"} · {weight(freight.peso_toneladas)} ton · {freight.pedido?.oferta?.categoria || "Carga"} · Código {freight.codigo}</p></div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-4 pl-5 sm:pl-0"><div className="text-right"><p className="font-['Bricolage_Grotesque'] text-[20px] font-extrabold text-[#1e3b21]">{money(freight.valor_frete)}</p><p className="text-[10px] text-[#91a08c]">{freight.valor_frete == null ? "Valor não informado" : "Valor registrado"}</p></div><button onClick={(e) => openModal(freight, e.currentTarget)} className="rounded-xl bg-[#bbf139] px-5 py-3 text-xs font-extrabold text-[#16381c] hover:bg-[#d0fa64]">Aceitar</button></div>
            </article>
          ))}
        </section>
        <p className="mt-3 text-[11px] text-[#7f8c7c]" role="status">{displayedFreights.length} frete(s) encontrado(s) · lista atualizada automaticamente a cada 60 segundos com a aba visível.</p>

        {fleetOpen && <section id="frota" className="mt-5 scroll-mt-6 rounded-2xl border border-[#dfe7d8] bg-white p-5" aria-label="Minha frota">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-['Bricolage_Grotesque'] text-lg font-extrabold">Minha frota</h2><p className="mt-1 text-xs text-[#788779]">Gerencie seus veículos e a capacidade de carga.</p></div><span className="rounded-full bg-[#edf5e6] px-3 py-1 text-xs font-bold text-[#336b30]">{vehicles.length} veículo(s)</span></div>
          {vehicles.length === 0 ? <p className="mt-4 rounded-xl bg-[#f5f8ed] p-3 text-xs">Nenhum veículo cadastrado.</p> : <div className="mt-4 grid gap-2 md:grid-cols-2">{vehicles.map((vehicle) => <div key={vehicle.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e2eadb] p-3"><span className="text-xs"><b>{vehicle.tipo_veiculo}</b><span className="block text-[#819081]">Capacidade: {weight(vehicle.capacidade_toneladas)} toneladas</span></span><button type="button" disabled={fleetBusyId !== null || busy} onClick={() => void deactivateVehicle(vehicle)} className="rounded-lg border border-[#e0e6d9] px-3 py-2 text-[11px] font-bold hover:bg-red-50 disabled:opacity-50">{fleetBusyId === vehicle.id ? "Desativando..." : "Desativar"}</button></div>)}</div>}
          <VehicleForm onCreated={(vehicle) => { setFleetMessage(`Veículo ${vehicle.tipo_veiculo} cadastrado (${weight(vehicle.capacidade_toneladas)} t).`); setError(""); }} />
          {fleetMessage && <p role="status" className="mt-3 text-xs font-bold text-[#2c7735]">{fleetMessage}</p>}
        </section>}
      </main>
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
                  const compatible = Number(vehicle.capacidade_toneladas) >= Number(selected.peso_toneladas);
                  return (
                    <option key={vehicle.id} value={vehicle.id} disabled={!compatible}>
                      {vehicle.tipo_veiculo} — {weight(vehicle.capacidade_toneladas)} t
                      {!compatible ? " (capacidade insuficiente)" : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            <p className="mt-2 text-xs text-[#718075]">O veículo precisa suportar pelo menos {weight(selected.peso_toneladas)} toneladas. Os veículos incompatíveis aparecem desabilitados.</p>

            <VehicleForm onCreated={(vehicle) => {
              if (Number(vehicle.capacidade_toneladas) >= Number(selected.peso_toneladas)) {
                setVehicleId(vehicle.id);
                setError("");
              } else {
                setError(`O veículo ${vehicle.tipo_veiculo} foi cadastrado, mas sua capacidade é insuficiente para este frete.`);
              }
            }} />

            {compatibleVehicles.length === 0 && (
              <p className="mt-3 text-sm text-amber-700">
                Você não possui um veículo compatível com esta carga.
              </p>
            )}

            {displayError && (
              <p className="mt-3 text-sm text-red-700">
                {displayError}
              </p>
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
function VehicleForm({ onCreated }: { onCreated: (vehicle: Vehicle) => void }) {
  const createVehicleFromStore = useFreightStore((state) => state.createVehicle);
  const [type, setType] = useState("TRUCK");
  const [capacity, setCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function save() {
    setSaving(true);
    setFeedback("");
    try {
      const created = await createVehicleFromStore(type, Number(capacity.replace(",", ".")));
      setCapacity("");
      setFeedback(`Veículo ${created.tipo_veiculo} cadastrado (${weight(created.capacidade_toneladas)} t).`);
      onCreated(created);
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
          aria-label="Tipo do veículo"
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-[#dfe6da] bg-white p-2.5 text-sm"
        >
          {vehicleTypes.map((item) => (
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
