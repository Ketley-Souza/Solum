import { CalendarDays, MapPin, Navigation, Truck } from "lucide-react";
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
    id: "FR-1982",
    product: "Soja a granel",
    origin: "Uberaba, MG",
    destination: "Campinas, SP",
    status: "Em trânsito",
    progress: 68,
    date: "18 out, 2026",
    price: "R$ 5.400",
  },
  {
    id: "FR-2016",
    product: "Milho a granel",
    origin: "Rio Verde, GO",
    destination: "Uberlândia, MG",
    status: "Aguardando coleta",
    progress: 12,
    date: "20 out, 2026",
    price: "R$ 4.850",
  },
  {
    id: "FR-2031",
    product: "Farelo de soja",
    origin: "Sorriso, MT",
    destination: "Rondonópolis, MT",
    status: "Coleta confirmada",
    progress: 28,
    date: "21 out, 2026",
    price: "R$ 4.700",
  },
];

export default function MyFreightsPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">

      <ProfileNavbar
        profileName="Marcos"
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-12">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Acompanhamento
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Meus fretes
            </h1>
            <p className="mt-2 text-sm text-[#66736a]">
              Acompanhe o andamento das cargas sob sua responsabilidade.
            </p>
          </div>

          <span className="rounded-full bg-[#eaf5e3] px-4 py-2 text-sm font-extrabold text-[#2f681f]">
            3 fretes ativos
          </span>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {[
            ["Em trânsito", "1"],
            ["Aguardando coleta", "1"],
            ["Coleta confirmada", "1"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-[#e4e9e1] bg-white p-5"
            >
              <p className="text-sm text-[#718075]">{label}</p>
              <p className="mt-2 text-3xl font-extrabold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {freights.map((freight) => (
            <article
              key={freight.id}
              className="rounded-2xl border border-[#e4e9e1] bg-white p-5 md:p-6"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <span className="text-xs font-extrabold text-[#65815b]">
                    {freight.id}
                  </span>
                  <h2 className="mt-1 text-lg font-extrabold">
                    {freight.product}
                  </h2>
                  <p className="mt-1 text-sm text-[#718075]">
                    {freight.price}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#f0f5ec] px-3 py-1.5 text-xs font-extrabold text-[#3f6b35]">
                  {freight.status}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#46723a]" />
                  <div>
                    <p className="text-xs text-[#718075]">Origem</p>
                    <p className="mt-1 font-bold">{freight.origin}</p>
                  </div>
                </div>

                <Navigation
                  size={18}
                  className="hidden text-[#7e9277] md:block"
                />

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#46723a]" />
                  <div>
                    <p className="text-xs text-[#718075]">Destino</p>
                    <p className="mt-1 font-bold">{freight.destination}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs font-bold text-[#66736a]">
                  <span>Progresso do frete</span>
                  <span>{freight.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf0e9]">
                  <div
                    className="h-full rounded-full bg-[#8bbd45]"
                    style={{ width: `${freight.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0e9] pt-4 text-sm text-[#718075]">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={15} />
                  Previsão: {freight.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck size={16} />
                  Transporte agrícola
                </span>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#849087]">
          Dados ilustrativos. O rastreamento ainda não está conectado à API.
        </p>
      </main>
    </div>
  );
}