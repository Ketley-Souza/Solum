import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  Truck,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";

const links = [
  { label: "Visão geral", href: "/transportador" },
  {
    label: "Fretes disponíveis",
    href: "/transportador/fretes-disponiveis",
  },
  { label: "Meus fretes", href: "/transportador/meus-fretes" },
  { label: "Histórico", href: "/transportador/historico" },
];

const freights = [
  {
    id: "FR-2048",
    product: "Soja a granel",
    weight: "28 toneladas",
    origin: "Uberaba, MG",
    destination: "Ribeirão Preto, SP",
    date: "22 out, 2026",
    distance: "178 km",
    price: "R$ 3.850",
  },
  {
    id: "FR-2049",
    product: "Milho a granel",
    weight: "32 toneladas",
    origin: "Rio Verde, GO",
    destination: "Uberlândia, MG",
    date: "23 out, 2026",
    distance: "410 km",
    price: "R$ 6.200",
  },
  {
    id: "FR-2050",
    product: "Farelo de soja",
    weight: "30 toneladas",
    origin: "Sorriso, MT",
    destination: "Rondonópolis, MT",
    date: "24 out, 2026",
    distance: "275 km",
    price: "R$ 4.700",
  },
  {
    id: "FR-2051",
    product: "Café ensacado",
    weight: "18 toneladas",
    origin: "Patos de Minas, MG",
    destination: "Franca, SP",
    date: "25 out, 2026",
    distance: "260 km",
    price: "R$ 4.100",
  },
];

export default function AvailableFreightsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">

      <ProfileNavbar
        profileName="Carlos Silva"
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-12">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Oportunidades de transporte
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Fretes disponíveis
            </h1>
            <p className="mt-2 text-sm text-[#66736a]">
              Encontre cargas que combinam com sua rota e mantenha sua frota em
              movimento.
            </p>
          </div>

          <span className="w-fit rounded-xl bg-[#eaf5e3] px-4 py-3 text-sm font-bold text-[#2f681f]">
            14 oportunidades encontradas
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-[#e5e9e1] bg-white p-4 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#e1e6de] px-3 py-3 text-sm text-[#718075]">
            <Search size={16} />
            <span>Buscar por origem, destino ou carga</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce4d7] px-4 py-3 text-sm font-bold text-[#35523a]"
          >
            <SlidersHorizontal size={16} />
            Filtros
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {freights.map((freight) => (
            <article
              key={freight.id}
              className="rounded-2xl border border-[#e4e9e1] bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-[#f0f5ec] px-3 py-1 text-xs font-extrabold text-[#3f6b35]">
                    {freight.id}
                  </span>
                  <h2 className="mt-3 text-lg font-extrabold">
                    {freight.product}
                  </h2>
                  <p className="mt-1 text-sm text-[#738076]">
                    {freight.weight}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-[#758176]">
                    Valor do frete
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-[#2f681f]">
                    {freight.price}
                  </p>
                </div>
              </div>

              <div className="my-5 grid gap-4 rounded-xl bg-[#fafbf8] p-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <div>
                  <p className="text-xs text-[#758176]">Origem</p>
                  <p className="mt-1 font-bold">{freight.origin}</p>
                </div>

                <ArrowRight
                  size={18}
                  className="hidden text-[#6a8a5d] sm:block"
                />

                <div>
                  <p className="text-xs text-[#758176]">Destino</p>
                  <p className="mt-1 font-bold">{freight.destination}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#627066]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} />
                  {freight.distance}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={15} />
                  Coleta: {freight.date}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck size={15} />
                  Carga agrícola
                </span>
              </div>

              <button
                type="button"
                className="mt-5 w-full rounded-xl bg-[#c1f23c] px-4 py-3 text-sm font-extrabold text-[#173516] hover:bg-[#d1fa62]"
              >
                Ver detalhes do frete
              </button>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#849087]">
          Dados ilustrativos. Busca, filtros e botões ainda não estão conectados.
        </p>
      </main>
    </div>
  );
}