import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Coffee,
  FlaskConical,
  MapPin,
  Search,
  Sprout,
  Tractor,
  Wheat,
  PackageSearch,
  RefreshCw,
} from "lucide-react";

import ProfileNavbar from "../../components/ProfileNavbar";

import {
  useOfferStore,
  selectMarketplaceOffers,
  selectMarketplaceLoading,
  selectMarketplaceError,
} from "../../stores/offerStore";

import type { BackendOffer } from "../../services/offerService";
import { notificationService } from "../../services/notificationService";

import { useAuthStore } from "../../stores/authStore";

import heroImage from "../../assets/hero.jpg";
import sojaImage from "../../assets/offer-soja.jpg";
import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";
import algodaoImage from "../../assets/offer-algodao.jpg";

type CategoryInfo = {
  name: string;
  count: number;
  icon: typeof Wheat;
};

type Offer = {
  id: string;
  category: string;
  title: string;
  detail: string;
  price: number;
  unit: string;
  city: string;
  seller: string;
  image: string;
  tag: string;
  state: string;
  deliveryPeriod: string;
};

function getCategoryIcon(category: string) {
  const value = category.toLowerCase();

  if (value.includes("café") || value.includes("cafe")) {
    return Coffee;
  }

  if (value.includes("semente")) {
    return Sprout;
  }

  if (value.includes("insumo") || value.includes("fertilizante")) {
    return FlaskConical;
  }

  if (value.includes("máquina") || value.includes("maquina")) {
    return Tractor;
  }

  return Wheat;
}

function getOfferImage(offer: BackendOffer): string {
  if (offer.imagem_url) {
    return offer.imagem_url;
  }

  const value = `${offer.produto} ${offer.categoria}`.toLowerCase();

  if (value.includes("café") || value.includes("cafe")) {
    return cafeImage;
  }

  if (value.includes("milho")) {
    return milhoImage;
  }

  if (value.includes("soja")) {
    return sojaImage;
  }

  if (value.includes("algodão") || value.includes("algodao")) {
    return algodaoImage;
  }

  return heroImage;
}

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte a oferta recebida do backend sem alterar sua categoria. */
function fromBackend(offer: BackendOffer): Offer {
  const unitName = (offer.unidade || "").toLowerCase();

  return {
    id: String(offer.id),
    category: offer.categoria?.trim() || "Outros",
    title: offer.produto,
    detail: `${offer.qualidade} • ${Number(offer.quantidade)} ${offer.unidade}`,
    price: Number(offer.preco),
    unit: unitName.startsWith("saca")
      ? "saca"
      : unitName.startsWith("ton")
        ? "tonelada"
        : unitName.startsWith("kg")
          ? "kg"
          : offer.unidade,
    city: offer.localizacao,
    seller: offer.produtor?.nome || "Produtor",
    image: getOfferImage(offer),
    tag: offer.safra ? `SAFRA ${offer.safra}` : "OFERTA ATIVA",
    state: offer.localizacao?.match(/([A-Z]{2})\s*$/)?.[1] || "",
    deliveryPeriod: offer.periodo || "",
  };
}

/** Retorna true somente quando o período cadastrado ainda não terminou. */
function isOfferPeriodValid(period: string): boolean {
  const value = (period || "").trim();
  if (!value) return false;

  const parts = value.split(/\s+a\s+/i);
  if (parts.length !== 2) return false;

  function parseLocalDate(input: string): Date | null {
    const match = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  const start = parseLocalDate(parts[0]);
  const end = parseLocalDate(parts[1]);
  if (!start || !end || end < start) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end >= today;
}

/**
 * Verifica se o período informado pela oferta atende ao filtro.
 * Aceita períodos em texto, como "Até 15 dias", e datas.
 */
function matchesDelivery(period: string, filter: string): boolean {
  if (filter === "Todos os períodos") {
    return true;
  }

  const normalized = period
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (!normalized.trim()) {
    return false;
  }

  if (filter === "A combinar") {
    return normalized.includes("combinar");
  }

  const maxDays = filter === "Até 15 dias" ? 15 : 30;

  const dayMatch = normalized.match(/(\d+)\s*dias?/);

  if (dayMatch) {
    return Number(dayMatch[1]) <= maxDays;
  }

  // Também aceita datas no formato YYYY-MM-DD ou DD/MM/YYYY.
  const dateMatches = normalized.match(
    /\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/g
  );

  if (dateMatches) {
    const dates = dateMatches.map((value) => {
      if (value.includes("-")) {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
      }

      const [day, month, year] = value.split("/").map(Number);
      return new Date(year, month - 1, day);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDates = dates.filter((date) => date >= today);

    if (!futureDates.length) {
      return false;
    }

    const firstDate = Math.min(
      ...futureDates.map((date) => date.getTime())
    );

    const daysUntil = Math.ceil(
      (firstDate - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysUntil <= maxDays;
  }

  // Não classifica automaticamente um período desconhecido.
  return false;
}

export default function BuyerPage() {
  const backendOffers = useOfferStore(selectMarketplaceOffers);
  const isLoading = useOfferStore(selectMarketplaceLoading);
  const error = useOfferStore(selectMarketplaceError);
  const fetchMarketplace = useOfferStore(
    (state) => state.fetchMarketplace
  );

  const user = useAuthStore((state) => state.user);

  const [notificationCount, setNotificationCount] = useState(0);

  const [category, setCategory] = useState("Todas as categorias");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [state, setState] = useState("Todos");
  const [delivery, setDelivery] = useState("Todos os períodos");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Busca as ofertas reais do marketplace.
  useEffect(() => {
    void fetchMarketplace();
  }, [fetchMarketplace]);

  // Busca a quantidade real de notificações não lidas.
  useEffect(() => {
    let active = true;

    notificationService
      .list()
      .then((notifications) => {
        if (active) {
          setNotificationCount(
            notifications.filter((item) => !item.lida).length
          );
        }
      })
      .catch(() => {
        if (active) {
          setNotificationCount(0);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Só utiliza ofertas recebidas do backend.
  // Exibe somente ofertas ativas com período de disponibilidade válido.
  // Ofertas futuras permanecem visíveis, mas a negociação só abre na data inicial.
  const remoteOffers = useMemo(
    () => backendOffers
      .filter((offer) => offer.status === "ATIVA" && isOfferPeriodValid(offer.periodo))
      .map(fromBackend),
    [backendOffers]
  );

  // Categorias e quantidades calculadas com os dados reais.
  const categories = useMemo<CategoryInfo[]>(() => {
    const counts = new Map<string, number>();

    remoteOffers.forEach((offer) => {
      counts.set(
        offer.category,
        (counts.get(offer.category) || 0) + 1
      );
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        icon: getCategoryIcon(name),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [remoteOffers]);

  // Estados disponíveis de acordo com as ofertas reais.
  const states = useMemo(() => {
    const availableStates = new Set(
      remoteOffers
        .map((offer) => offer.state)
        .filter(Boolean)
    );

    return ["Todos", ...Array.from(availableStates).sort()];
  }, [remoteOffers]);

  // Aplicação de todos os filtros.
  const filteredOffers = useMemo(() => {
    const normalizedSearch = appliedSearch
      .trim()
      .toLocaleLowerCase("pt-BR");

    const minimum = minPrice.trim() ? Number(minPrice) : null;
    const maximum = maxPrice.trim() ? Number(maxPrice) : null;

    return remoteOffers.filter((offer) => {
      const matchesCategory =
        category === "Todas as categorias" ||
        offer.category === category;

      const matchesState =
        state === "Todos" || offer.state === state;

      const searchText = [
        offer.title,
        offer.detail,
        offer.city,
        offer.category,
        offer.seller,
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      const matchesSearch =
        !normalizedSearch || searchText.includes(normalizedSearch);

      const matchesMinimum =
        minimum === null || offer.price >= minimum;

      const matchesMaximum =
        maximum === null || offer.price <= maximum;

      const matchesPeriod = matchesDelivery(
        offer.deliveryPeriod,
        delivery
      );

      return (
        matchesCategory &&
        matchesState &&
        matchesSearch &&
        matchesMinimum &&
        matchesMaximum &&
        matchesPeriod
      );
    });
  }, [
    remoteOffers,
    category,
    state,
    appliedSearch,
    minPrice,
    maxPrice,
    delivery,
  ]);

  function clearFilters() {
    setCategory("Todas as categorias");
    setSearch("");
    setAppliedSearch("");
    setState("Todos");
    setDelivery("Todos os períodos");
    setMinPrice("");
    setMaxPrice("");
  }

  function retryMarketplace() {
    void fetchMarketplace(true);
  }

  return (
    <div
      id="topo"
      className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]"
    >
      <ProfileNavbar
        profileName={user?.name || "Comprador"}
        role="COMPRADOR"
        notificationCount={notificationCount}
        notificationsHref="/comprador/notificacoes"
        links={[
          {
            label: "Marketplace",
            href: "/comprador",
          },
          {
            label: "Meus pedidos",
            href: "/comprador/pedidos",
          },
        ]}
      />

      <main className="mx-auto max-w-[1440px] space-y-9 px-5 pb-14 pt-8 md:px-12">

        {/* BANNER PRINCIPAL */}

        <section className="relative overflow-hidden rounded-[26px] bg-[#eef2e8] px-6 py-8 md:px-9 md:py-9">
          <div
            aria-hidden="true"
            className="absolute -right-4 -top-6 h-28 w-40 rotate-[-25deg] rounded-[100%] bg-[#e4f0cd]"
          />

          <div className="relative">
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#287a48]">
              Marketplace
            </p>

            <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold leading-tight md:text-4xl">
              Encontre o lote certo para seu negócio
            </h1>

            <p className="mt-2 text-sm text-[#708077]">
              Compare ofertas publicadas por produtores e encontre
              as melhores condições para sua operação.
            </p>

            <form
              className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(16,34,23,.06)] md:flex-row md:items-center"
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedSearch(search);

                document
                  .getElementById("ofertas")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 px-2 text-[#708077]">
                <Search size={19} aria-hidden="true" />

                <span className="sr-only">
                  Buscar produtos
                </span>

                <input
                  type="search"
                  className="w-full bg-transparent py-2 text-sm text-[#102217] outline-none placeholder:text-[#9aa79b]"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Busque por produto, categoria ou produtor"
                />
              </label>

              <span className="hidden h-7 w-px bg-[#e3e8df] md:block" />

              <span className="flex items-center gap-2 px-2 text-xs font-bold text-[#415247]">
                <MapPin size={16} className="text-[#287a48]" />
                Todo o Brasil
              </span>

              <button
                type="submit"
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#c1f23c] px-5 py-3 text-sm font-extrabold transition hover:bg-[#d1fa62]"
              >
                Buscar ofertas
                <Search size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* CATEGORIAS REAIS */}

        <section aria-labelledby="categories-title">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">
            Navegue pelo mercado
          </p>

          <h2
            id="categories-title"
            className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold"
          >
            Categorias disponíveis
          </h2>

          {categories.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {categories.map(({ name, count, icon: Icon }) => {
                const active = category === name;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setCategory(
                        active ? "Todas as categorias" : name
                      )
                    }
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      active
                        ? "border-[#1d4a14] bg-[#1d4a14] text-white"
                        : "border-[#dde3da] bg-white text-[#102217]"
                    }`}
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                        active
                          ? "bg-[#315d27] text-[#c1f23c]"
                          : "bg-[#e8f5ce] text-[#2f681f]"
                      }`}
                    >
                      <Icon size={20} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-extrabold">
                        {name}
                      </strong>

                      <small
                        className={`block text-[11px] ${
                          active
                            ? "text-white/65"
                            : "text-[#708077]"
                        }`}
                      >
                        {count} {count === 1 ? "oferta" : "ofertas"}
                      </small>
                    </span>

                    <ArrowRight
                      size={15}
                      className="shrink-0 opacity-60"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-2xl border border-[#dde3da] bg-white p-5 text-sm text-[#708077]">
              Nenhuma categoria disponível no momento.
            </p>
          )}
        </section>

        {/* BANNER INFORMATIVO E FILTROS */}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          <div className="relative min-h-[270px] overflow-hidden rounded-[22px] bg-[#1d4a14] md:min-h-[320px]">
            <img
              src={heroImage}
              alt="Estrutura de armazenagem agrícola"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102217]/90 via-[#102217]/30 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 text-white md:p-8">
              <span className="inline-block rounded-full bg-[#e8f5ce] px-3 py-1 text-[10px] font-extrabold text-[#287a48]">
                SOLUM MARKETPLACE
              </span>

              <h2 className="mt-3 max-w-md font-['Bricolage_Grotesque'] text-2xl font-extrabold leading-tight md:text-3xl">
                Conectando produtores e compradores
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/80">
                Consulte ofertas reais, compare preços e encontre
                oportunidades para o seu negócio.
              </p>
            </div>
          </div>

          {/* FILTROS */}

          <aside className="self-start rounded-[22px] border border-[#dde3da] bg-white p-5 shadow-[0_4px_16px_rgba(16,34,23,.03)]">
            <div className="flex items-center justify-between">
              <h2 className="font-['Bricolage_Grotesque'] text-xl font-extrabold">
                Refine sua busca
              </h2>

              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer text-xs font-bold text-[#287a48] hover:underline"
              >
                Limpar
              </button>
            </div>

            <label className="mt-5 block text-[10px] font-bold uppercase text-[#708077]">
              Cultura ou insumo

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-3 py-3 text-sm font-semibold text-[#415247] outline-none"
              >
                <option value="Todas as categorias">
                  Todas as categorias
                </option>

                {categories.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-[10px] font-bold uppercase text-[#708077]">
                Estado

                <select
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs font-semibold text-[#415247] outline-none"
                >
                  {states.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-[10px] font-bold uppercase text-[#708077]">
                Entrega

                <select
                  value={delivery}
                  onChange={(event) => setDelivery(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs font-semibold text-[#415247] outline-none"
                >
                  {[
                    "Todos os períodos",
                    "Até 15 dias",
                    "Até 30 dias",
                    "A combinar",
                  ].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 border-t border-[#edf0e9] pt-4">
              <p className="text-[10px] font-bold uppercase text-[#708077]">
                Faixa de preço por unidade
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <label>
                  <span className="text-[10px] text-[#708077]">
                    Mínimo (R$)
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="0,00"
                    className="mt-1 w-full min-w-0 rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs text-[#415247] outline-none focus:border-[#287a48]"
                  />
                </label>

                <label>
                  <span className="text-[10px] text-[#708077]">
                    Máximo (R$)
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Sem limite"
                    className="mt-1 w-full min-w-0 rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs text-[#415247] outline-none focus:border-[#287a48]"
                  />
                </label>
              </div>

              {minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
                <p className="mt-2 text-xs text-red-600">
                  O preço mínimo não pode ser maior que o máximo.
                </p>
              )}
            </div>
          </aside>
        </section>

        {/* OFERTAS REAIS */}

        <section
          id="ofertas"
          aria-labelledby="offers-title"
          className="scroll-mt-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">
                Marketplace
              </p>

              <h2
                id="offers-title"
                className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold"
              >
                Ofertas para sua operação
              </h2>
            </div>

            <span className="text-xs font-bold text-[#2f681f]">
              {isLoading
                ? "Carregando ofertas..."
                : `${filteredOffers.length} ${
                    filteredOffers.length === 1 ? "oferta exibida" : "ofertas exibidas"
                  }`}
              <ArrowRight size={14} className="ml-1 inline" />
            </span>
          </div>

          {/* CARREGAMENTO */}

          {isLoading && remoteOffers.length === 0 && (
            <div className="mt-5 rounded-2xl border border-[#dde3da] bg-white p-10 text-center">
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-[#287a48]"
              />

              <p className="mt-3 text-sm font-bold text-[#415247]">
                Buscando ofertas no marketplace...
              </p>

              <p className="mt-1 text-xs text-[#708077]">
                Aguarde enquanto carregamos os dados.
              </p>
            </div>
          )}

          {/* ERRO DA API */}

          {!isLoading && error && remoteOffers.length === 0 && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-white p-10 text-center">
              <p className="font-bold text-red-700">
                Não foi possível carregar as ofertas.
              </p>

              <p className="mt-2 text-sm text-[#708077]">
                {error}
              </p>

              <button
                type="button"
                onClick={retryMarketplace}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1d4a14] px-5 py-3 text-sm font-bold text-white hover:bg-[#287a48]"
              >
                <RefreshCw size={15} />
                Tentar novamente
              </button>
            </div>
          )}

          {/* ERRO COM DADOS ANTERIORES */}

          {!isLoading && error && remoteOffers.length > 0 && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Não foi possível atualizar as ofertas. Os dados carregados
              anteriormente continuam sendo exibidos.
            </p>
          )}

          {/* BANCO SEM OFERTAS */}

          {!isLoading && !error && remoteOffers.length === 0 && (
            <div className="mt-5 rounded-2xl border border-[#dde3da] bg-white p-10 text-center">
              <PackageSearch
                size={34}
                className="mx-auto text-[#9aa79b]"
              />

              <p className="mt-3 font-bold">
                Ainda não existem ofertas disponíveis.
              </p>

              <p className="mt-2 text-sm text-[#708077]">
                Quando os produtores publicarem novas ofertas,
                elas aparecerão aqui.
              </p>
            </div>
          )}

          {/* RESULTADOS */}

          {remoteOffers.length > 0 && (
            filteredOffers.length > 0 ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {filteredOffers.map((offer) => (
                  <Link
                    key={offer.id}
                    to={`/comprador/negociacao/${offer.id}`}
                    className="block overflow-hidden rounded-[20px] border border-[#e2e7dd] bg-white text-[#102217] no-underline shadow-[0_6px_18px_rgba(16,34,23,.06)] transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-[#e9f7d9] px-3 py-1 text-[10px] font-extrabold text-[#287a48]">
                        {offer.tag}
                      </span>
                    </div>

                    <div className="p-4">
                      <span className="text-[10px] font-bold uppercase text-[#287a48]">
                        {offer.category}
                      </span>

                      <h3 className="mt-1 font-['Bricolage_Grotesque'] text-base font-extrabold">
                        {offer.title}
                      </h3>

                      <p className="mt-1 text-xs text-[#708077]">
                        {offer.detail}
                      </p>

                      <strong className="mt-3 block text-xl font-extrabold text-[#287a48]">
                        {formatPrice(offer.price)}

                        <span className="ml-1 text-xs font-normal text-[#708077]">
                          / {offer.unit}
                        </span>
                      </strong>

                      <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-[#708077]">
                        <span className="flex items-center gap-1">
                          <MapPin
                            size={12}
                            className="text-[#287a48]"
                          />
                          {offer.city}
                        </span>

                        <span className="truncate">
                          {offer.seller}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-[#dde3da] bg-white p-10 text-center">
                <PackageSearch
                  size={34}
                  className="mx-auto text-[#9aa79b]"
                />

                <p className="mt-3 font-bold">
                  Nenhuma oferta encontrada com esses filtros.
                </p>

                <p className="mt-2 text-sm text-[#708077]">
                  Tente alterar a categoria, o estado, o período
                  de entrega ou a faixa de preço.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 cursor-pointer text-sm font-bold text-[#287a48] underline"
                >
                  Limpar filtros
                </button>
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
