
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Coffee,
  FlaskConical,
  MapPin,
  Search,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react";

import ProfileNavbar from "../../components/ProfileNavbar";

import heroImage from "../../assets/hero.jpg";
import sojaImage from "../../assets/offer-soja.jpg";
import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";
import algodaoImage from "../../assets/offer-algodao.jpg";

type Category =
  | "Grãos"
  | "Café"
  | "Sementes"
  | "Insumos"
  | "Máquinas";

type CategoryFilter = Category | "Todas as categorias";

type Offer = {
  id: number;
  category: Category;
  title: string;
  detail: string;
  price: string;
  unit: string;
  city: string;
  seller: string;
  image: string;
  tag: string;
  state: string;
};

const categories: {
  name: Category;
  count: string;
  icon: LucideIcon;
}[] = [
  { name: "Grãos", count: "216 ofertas", icon: Wheat },
  { name: "Café", count: "86 ofertas", icon: Coffee },
  { name: "Sementes", count: "65 ofertas", icon: Sprout },
  { name: "Insumos", count: "104 ofertas", icon: FlaskConical },
  { name: "Máquinas", count: "52 ofertas", icon: Tractor },
];

const offers: Offer[] = [
  {
    id: 1,
    category: "Grãos",
    title: "Soja padrão exportação",
    detail: "Lote de 320 t · 14% umidade",
    price: "R$ 132,00",
    unit: "saca",
    city: "Sorriso, MT",
    seller: "AgroHorizonte",
    image: sojaImage,
    tag: "PRONTA ENTREGA",
    state: "MT",
  },
  {
    id: 2,
    category: "Café",
    title: "Café arábica especial",
    detail: "Bebida fina · 84 pontos",
    price: "R$ 980,00",
    unit: "saca",
    city: "Guaxupé, MG",
    seller: "Fazenda Bela Vista",
    image: cafeImage,
    tag: "SAFRA 26/27",
    state: "MG",
  },
  {
    id: 3,
    category: "Grãos",
    title: "Milho safrinha seco",
    detail: "Lote de 180 t · Tipo 1",
    price: "R$ 64,50",
    unit: "saca",
    city: "Cascavel, PR",
    seller: "Coop. Campo Sul",
    image: milhoImage,
    tag: "FRETE COTÁVEL",
    state: "PR",
  },
  {
    id: 4,
    category: "Grãos",
    title: "Algodão pluma HVI",
    detail: "Fibra 30,8 mm · Tipo 4-1",
    price: "R$ 142,00",
    unit: "saca",
    city: "Luís Eduardo, BA",
    seller: "Verde Oeste",
    image: algodaoImage,
    tag: "VERIFICADO",
    state: "BA",
  },
];

export default function ProducerPage() {
  const [category, setCategory] =
    useState<CategoryFilter>("Todas as categorias");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [state, setState] = useState("Todos");
  const [delivery, setDelivery] = useState("Até 30 dias");

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
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

      const matchesSearch = searchText.includes(
        appliedSearch.trim().toLocaleLowerCase("pt-BR")
      );

      return (
        matchesCategory &&
        matchesState &&
        matchesSearch
      );
    });
  }, [category, state, appliedSearch]);

  function clearFilters() {
    setCategory("Todas as categorias");
    setSearch("");
    setAppliedSearch("");
    setState("Todos");
    setDelivery("Até 30 dias");
  }

  return (
    <div
      id="topo"
      className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]"
    >
      <ProfileNavbar
        profileName="João Ribeiro"
        role="PRODUTOR"
        links={[
          {
            label: "Marketplace",
            href: "/produtor",
          },
          {
            label: "Meus pedidos",
            href: "/produtor/pedidos",
          },
          {
            label: "Negociações",
            href: "/produtor/negociacao/1",
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
              Conta produtora · Mercado ativo
            </p>

            <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold leading-tight md:text-4xl">
              Encontre o lote certo para seu negócio
            </h1>

            <p className="mt-2 text-sm text-[#708077]">
              Compare ofertas verificadas, condições comerciais
              e rotas de origem com transparência — do campo ao recebimento.
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
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Busque por soja, fertilizante, semente ou produtor"
                />
              </label>

              <span className="hidden h-7 w-px bg-[#e3e8df] md:block" />

              <span className="flex items-center gap-2 px-2 text-xs font-bold text-[#415247]">
                <MapPin
                  size={16}
                  className="text-[#287a48]"
                />
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

        {/* CATEGORIAS */}

        <section aria-labelledby="categories-title">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">
            Navegue pelo mercado
          </p>

          <h2
            id="categories-title"
            className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold"
          >
            Categorias em movimento
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ name, count, icon: Icon }) => {
              const active = category === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() =>
                    setCategory(
                      active
                        ? "Todas as categorias"
                        : name
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
                      {count}
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
        </section>

        {/* BANNER E FILTROS */}

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">

          {/* BANNER DE DESTAQUE */}

          <div className="relative min-h-[270px] overflow-hidden rounded-[22px] bg-[#1d4a14] md:min-h-[320px]">
            <img
              src={heroImage}
              alt="Estrutura de armazenagem agrícola"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#102217]/90 via-[#102217]/25 to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 text-white md:p-8">
              <span className="inline-block rounded-full bg-[#e8f5ce] px-3 py-1 text-[10px] font-extrabold text-[#287a48]">
                DESTAQUE SOLUM
              </span>

              <h2 className="mt-3 max-w-md font-['Bricolage_Grotesque'] text-2xl font-extrabold leading-tight md:text-3xl">
                Soja certificada com origem rastreada em Mato Grosso
              </h2>

              <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/80">
                <strong className="text-lg text-[#c1f23c]">
                  R$ 131,80 / saca
                </strong>

                <span>
                  420 t disponíveis · Nova Mutum, MT
                </span>
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
                onChange={(event) =>
                  setCategory(
                    event.target.value as CategoryFilter
                  )
                }
                className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-3 py-3 text-sm font-semibold text-[#415247] outline-none"
              >
                <option value="Todas as categorias">
                  Todas as categorias
                </option>

                {categories.map((item) => (
                  <option
                    key={item.name}
                    value={item.name}
                  >
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
                  onChange={(event) =>
                    setState(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs font-semibold text-[#415247] outline-none"
                >
                  {["Todos", "MT", "MG", "PR", "BA"].map(
                    (value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="text-[10px] font-bold uppercase text-[#708077]">
                Entrega

                <select
                  value={delivery}
                  onChange={(event) =>
                    setDelivery(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-[#dde3da] bg-white px-2 py-3 text-xs font-semibold text-[#415247] outline-none"
                >
                  {[
                    "Até 30 dias",
                    "Até 15 dias",
                    "A combinar",
                  ].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-4 border-t border-[#edf0e9] pt-4 text-xs font-semibold text-[#415247]">
              R$ 50 – R$ 1.200 por unidade
            </p>
          </aside>
        </section>

        {/* OFERTAS CLICÁVEIS */}

        <section
          id="ofertas"
          aria-labelledby="offers-title"
          className="scroll-mt-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">
                Atualizado recentemente
              </p>

              <h2
                id="offers-title"
                className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold"
              >
                Ofertas para sua operação
              </h2>
            </div>

            <span className="text-xs font-bold text-[#2f681f]">
              {filteredOffers.length} ofertas exibidas
              <ArrowRight
                size={14}
                className="ml-1 inline"
              />
            </span>
          </div>

          {filteredOffers.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {filteredOffers.map((offer) => (
                <Link
                  key={offer.id}
                  to={`/produtor/negociacao/${offer.id}`}
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
                    <h3 className="font-['Bricolage_Grotesque'] text-base font-extrabold">
                      {offer.title}
                    </h3>

                    <p className="mt-1 text-xs text-[#708077]">
                      {offer.detail}
                    </p>

                    <strong className="mt-3 block text-xl font-extrabold text-[#287a48]">
                      {offer.price}

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
            <div className="mt-4 rounded-2xl border border-[#dde3da] bg-white p-10 text-center">
              <p className="font-bold">
                Nenhuma oferta encontrada.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 cursor-pointer text-sm font-bold text-[#287a48] underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
