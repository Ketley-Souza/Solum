import { CalendarDays, CheckCircle2 } from "lucide-react";
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

const completed = [
  {
    id: "FR-1874",
    product: "Soja a granel",
    origin: "Uberaba, MG",
    destination: "São Paulo, SP",
    date: "14 out, 2026",
    distance: "490 km",
    price: "R$ 6.800",
  },
  {
    id: "FR-1829",
    product: "Milho a granel",
    origin: "Rio Verde, GO",
    destination: "Uberlândia, MG",
    date: "10 out, 2026",
    distance: "410 km",
    price: "R$ 5.950",
  },
  {
    id: "FR-1761",
    product: "Café ensacado",
    origin: "Patrocínio, MG",
    destination: "Ribeirão Preto, SP",
    date: "06 out, 2026",
    distance: "310 km",
    price: "R$ 4.600",
  },
  {
    id: "FR-1705",
    product: "Farelo de soja",
    origin: "Rondonópolis, MT",
    destination: "Campo Grande, MS",
    date: "02 out, 2026",
    distance: "490 km",
    price: "R$ 6.100",
  },
];

export default function CarrierHistoryPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">

      <ProfileNavbar
        profileName="Marcos"
        role="TRANSPORTADOR"
        links={links}
      />

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 lg:px-12">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[#548047]">
          Seu desempenho
        </p>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-['Bricolage_Grotesque'] text-3xl font-extrabold md:text-4xl">
              Histórico de fretes
            </h1>
            <p className="mt-2 text-sm text-[#66736a]">
              Consulte os transportes concluídos e acompanhe seu histórico de
              entregas.
            </p>
          </div>

          <div className="rounded-xl border border-[#e2e8dd] bg-white px-4 py-3">
            <p className="text-xs text-[#718075]">Fretes concluídos</p>
            <p className="mt-1 text-2xl font-extrabold">28</p>
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e4e9e1] bg-white p-5">
            <p className="text-sm text-[#718075]">Total recebido</p>
            <p className="mt-2 text-2xl font-extrabold text-[#2f681f]">
              R$ 86.450
            </p>
          </div>
          <div className="rounded-2xl border border-[#e4e9e1] bg-white p-5">
            <p className="text-sm text-[#718075]">Distância percorrida</p>
            <p className="mt-2 text-2xl font-extrabold">12.480 km</p>
          </div>
          <div className="rounded-2xl border border-[#e4e9e1] bg-white p-5">
            <p className="text-sm text-[#718075]">Avaliação média</p>
            <p className="mt-2 text-2xl font-extrabold">
              4,8 <span className="text-sm text-[#718075]">/ 5,0</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">Entregas recentes</h2>
          <span className="text-sm text-[#718075]">Outubro de 2026</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#e4e9e1] bg-white">
          {completed.map((freight, index) => (
            <article
              key={freight.id}
              className={`flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between ${
                index ? "border-t border-[#edf0e9]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-[#eaf5e3] p-2.5 text-[#2f681f]">
                  <CheckCircle2 size={20} />
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{freight.product}</h3>
                    <span className="rounded-full bg-[#eaf5e3] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#2f681f]">
                      Concluído
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#718075]">{freight.id}</p>
                  <p className="mt-2 text-sm text-[#4d5b50]">
                    {freight.origin} <span className="px-1">→</span>{" "}
                    {freight.destination}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:min-w-[380px]">
                <div>
                  <p className="text-xs text-[#718075]">Data de entrega</p>
                  <p className="mt-1 text-sm font-bold">{freight.date}</p>
                </div>
                <div>
                  <p className="text-xs text-[#718075]">Distância</p>
                  <p className="mt-1 text-sm font-bold">{freight.distance}</p>
                </div>
                <div>
                  <p className="text-xs text-[#718075]">Valor</p>
                  <p className="mt-1 text-sm font-extrabold text-[#2f681f]">
                    {freight.price}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-[#849087]">
          Dados ilustrativos; nenhum histórico real foi consultado.
        </p>
      </main>
    </div>
  );
}