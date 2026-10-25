
import ProfileNavbar from "../../components/ProfileNavbar";
import { Package, Handshake, Wallet, Plus, ArrowRight } from "lucide-react";

import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";

const navigation = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];

const indicators = [
  {
    title: "Ofertas ativas",
    value: "4",
    detail: "+1 esta semana",
    icon: Package,
  },
  {
    title: "Negociações em andamento",
    value: "3",
    detail: "2 aguardam você",
    icon: Handshake,
  },
  {
    title: "Volume negociado em setembro",
    value: "R$ 45K",
    detail: "+18% no mês",
    icon: Wallet,
  },
];

export default function ProducerPage() {
  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName="João Ribeiro"
        role="PRODUTOR"
        links={navigation}
        notificationCount={2}
        notificationsHref="/produtor/notificacoes"
      />

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        {/* Saudação */}
        <section className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-[#2d6922]">
              Área do produtor
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Bom dia, João!
            </h1>
            <p className="mt-2 text-sm text-[#78877d]">
              Fazenda Boa Vista • Patos de Minas, MG
            </p>
          </div>
        </section>

        {/* Indicadores */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {indicators.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e0e6dd] bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-xl bg-[#edf5e8] p-3 text-[#2d6922]">
                    <Icon size={19} />
                  </span>
                  <span className="rounded-full bg-[#e5f5e9] px-3 py-1 text-xs font-bold text-[#287a48]">
                    {item.detail}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold">{item.value}</h2>
                <p className="mt-2 text-sm font-semibold text-[#708077]">
                  {item.title}
                </p>
              </div>
            );
          })}
        </section>

        {/* Ofertas e propostas */}
        <section className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          <div
            id="ofertas"
            className="rounded-2xl border border-[#e0e6dd] bg-white p-5 shadow-sm lg:col-span-2"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Minhas Ofertas</h2>
              <span className="text-xs font-semibold text-[#2d6922]">
                Ofertas recentes
              </span>
            </div>

            <div className="space-y-3">
              <article className="flex flex-wrap items-center gap-4 rounded-xl bg-[#f7f8f5] p-3">
                <img
                  src={cafeImage}
                  alt="Plantação de café"
                  className="h-16 w-20 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">
                      Café Arábica Especial
                    </h3>
                    <span className="rounded-full bg-[#dff4e6] px-2 py-1 text-[10px] font-bold text-[#26784c]">
                      Ativa
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#78877d]">
                    320 sacas • Bebida dura • Disponível até 25 out.
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-sm">R$ 1.280,00</strong>
                  <p className="text-xs text-[#78877d]">por saca</p>
                </div>
              </article>

              <article className="flex flex-wrap items-center gap-4 rounded-xl bg-[#f7f8f5] p-3">
                <img
                  src={milhoImage}
                  alt="Plantação de milho"
                  className="h-16 w-20 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold">
                      Milho Safrinha Seco
                    </h3>
                    <span className="rounded-full bg-[#fff0d5] px-2 py-1 text-[10px] font-bold text-[#ae6e13]">
                      Em negociação
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#78877d]">
                    480 sacas • Tipo 1 • 2 propostas recebidas
                  </p>
                </div>
                <div className="text-right">
                  <strong className="text-sm">R$ 66,50</strong>
                  <p className="text-xs text-[#78877d]">por saca</p>
                </div>
              </article>
            </div>
          </div>

          <div
            id="negociacoes"
            className="rounded-2xl bg-[#1d4818] p-6 text-white shadow-sm"
          >
            <h2 className="text-xl font-extrabold">
              Você tem 2 propostas novas
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#bdd2b9]">
              A mais recente é da Cooperativa Cerrado para seu lote de café.
            </p>

            <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-xs font-semibold text-[#d0f08a]">
                Cooperativa Cerrado
              </p>
              <p className="mt-2 text-2xl font-extrabold">
                R$ 1.245,00/saca
              </p>
              <p className="mt-1 text-xs text-[#bdd2b9]">
                Responder até amanhã, 18h
              </p>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold">
              <ArrowRight size={16} />
              Detalhes na página de negociações
            </div>
          </div>
        </section>

        <section id="pedidos" className="mt-8 text-center text-xs text-[#78877d]">
          Pedidos e logística serão implementados nas próximas etapas.
        </section>
      </main>
    </div>
  );
}
