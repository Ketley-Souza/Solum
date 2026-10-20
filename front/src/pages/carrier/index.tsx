import {
  ArrowRight,
  Check,
  CircleCheck,
  FileText,
  MapPin,
  Navigation,
  Star,
  Truck,
} from 'lucide-react'
import ProfileNavbar from '../../components/ProfileNavbar'
import { Link } from 'react-router-dom'

const navigationLinks = [
  { label: 'Visão geral', href: '/transportador' },
  { label: 'Fretes disponíveis', href: '/transportador/fretes-disponiveis' },
  { label: 'Meus fretes', href: '/transportador/meus-fretes' },
  { label: 'Histórico', href: '/transportador/historico' },
]

const metrics = [
  {
    label: 'Fretes esta semana',
    value: '3',
    description: 'Fretes realizados nesta semana',
    icon: Truck,
  },
  {
    label: 'Km rodados',
    value: '4.820 km',
    description: 'Distância percorrida no mês',
    icon: Navigation,
  },
  {
    label: 'Ganhos no mês',
    value: 'R$ 18.600',
    description: 'Valor total dos fretes',
    icon: FileText,
  },
  {
    label: 'Avaliação média',
    value: '4,8',
    description: '34 avaliações recebidas',
    icon: Star,
  },
]

const availableFreights = [
  {
    route: 'Rondonópolis, MT → Santos, SP',
    cargo: 'Soja',
    details: '30 ton · Bitrem · 1.850 km',
    price: 'R$ 4.200',
    urgent: true,
  },
  {
    route: 'Rio Verde, GO → São Paulo, SP',
    cargo: 'Milho',
    details: '25 ton · Carreta · 1.200 km',
    price: 'R$ 3.800',
    urgent: false,
  },
]

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  featured = false,
}: {
  label: string
  value: string
  description: string
  icon: typeof Truck
  featured?: boolean
}) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        featured
          ? 'border-[#193c22] bg-[#193c22] text-white'
          : 'border-[#e0e6dc] bg-white text-[#102217]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-xs ${
            featured ? 'text-white/75' : 'text-[#708077]'
          }`}
        >
          {label}
        </p>

        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            featured
              ? 'bg-white/10 text-[#c1f23c]'
              : 'bg-[#e8f3dc] text-[#2f681f]'
          }`}
        >
          <Icon size={17} />
        </span>
      </div>

      <p className="mt-3 font-['Bricolage_Grotesque'] text-2xl font-extrabold tracking-tight">
        {value}
      </p>

      <p
        className={`mt-2 text-[10px] ${
          featured ? 'text-white/60' : 'text-[#8a978b]'
        }`}
      >
        {description}
      </p>
    </article>
  )
}

function DeliveryStep({
  number,
  title,
  description,
  completed = false,
  active = false,
}: {
  number: number
  title: string
  description: string
  completed?: boolean
  active?: boolean
}) {
  return (
    <div className="relative z-[1] flex min-w-0 flex-col items-center text-center">
      <span
        className={`grid size-7 place-items-center rounded-full border text-xs font-bold ${
          completed
            ? 'border-[#2f681f] bg-[#2f681f] text-white'
            : active
              ? 'border-[#2f681f] bg-white text-[#2f681f] ring-4 ring-[#e8f3dc]'
              : 'border-[#d8e4d0] bg-white text-[#8a978b]'
        }`}
      >
        {completed ? <Check size={14} /> : number}
      </span>

      <p
        className={`mt-2 text-[10px] font-extrabold ${
          active ? 'text-[#2f681f]' : 'text-[#34483a]'
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-[#8a978b]">
        {description}
      </p>
    </div>
  )
}

function RecentFreight({
  route,
  cargo,
  date,
  price,
}: {
  route: string
  cargo: string
  date: string
  price: string
}) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-[#e0e6dc] bg-white p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e8f3dc] text-[#2f681f]">
        <CircleCheck size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xs font-extrabold">{route}</h3>
        <p className="mt-1 text-[10px] text-[#708077]">
          {cargo} · {date}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-extrabold">{price}</p>
        <p className="mt-1 text-[9px] font-bold text-[#287a48]">
          Entregue
        </p>
      </div>
    </article>
  )
}

export default function CarrierPage() {
  return (
    <div
      id="topo"
      className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]"
    >
      {/* Navbar existente: manter seu componente e arquivo intactos */}
      <ProfileNavbar
        profileName="Marcos"
        role="TRANSPORTADOR"
        links={navigationLinks}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {/* Saudação */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#39752b]">
              Painel do transportador
            </p>

            <h1 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight sm:text-4xl">
              Bom dia, Marcos!
            </h1>

            <p className="mt-2 text-sm text-[#708077]">
              Confira seus fretes e acompanhe o desempenho da sua frota.
            </p>
          </div>

          <Link
            to="/transportador/fretes-disponiveis"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#c1f23c] px-5 py-3 text-xs font-extrabold text-[#102217] transition hover:bg-[#d2f66d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]"
          >
            Encontrar fretes
            <ArrowRight size={15} />
          </Link>
        </section>

        {/* Indicadores */}
        <section
          aria-label="Indicadores do transportador"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.label}
              {...metric}
              featured={index === 0}
            />
          ))}
        </section>

        {/* Frete em andamento e oportunidades */}
        <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <article
            id="meus-fretes"
            className="min-w-0 rounded-2xl border border-[#e0e6dc] bg-white p-4 shadow-[0_4px_18px_rgba(16,34,23,0.035)] sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#708077]">
                  Acompanhe sua entrega
                </p>
                <h2 className="mt-1 font-['Bricolage_Grotesque'] text-lg font-extrabold">
                  Frete em andamento
                </h2>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3f3e8] px-3 py-1.5 text-[9px] font-extrabold text-[#287a48]">
                <span className="size-1.5 rounded-full bg-[#2f8b4c]" />
                EM TRANSPORTE
              </span>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl bg-[#f7f8f3] p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold text-[#708077]">
                  CÓDIGO FR-2026-004
                </p>
                <h3 className="mt-1 text-sm font-extrabold">
                  Transporte de soja
                </h3>
                <p className="mt-1 text-[10px] text-[#708077]">
                  TradeGrain S.A. · Bitrem · 28 toneladas
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-[10px] text-[#708077]">Valor do frete</p>
                <p className="mt-1 font-['Bricolage_Grotesque'] text-xl font-extrabold">
                  R$ 5.100,00
                </p>
              </div>
            </div>

            {/* Origem e destino */}
            <div className="mt-4 grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-xl border border-[#dce8d3] bg-[#f1f7e9] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#708077]">
                  Origem
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs font-extrabold">
                  <MapPin size={14} className="shrink-0 text-[#39752b]" />
                  Sorriso, MT
                </p>
              </div>

              <ArrowRight
                size={18}
                className="mx-auto hidden text-[#8a978b] sm:block"
              />

              <div className="rounded-xl border border-[#dce8d3] bg-[#f1f7e9] p-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-[#708077]">
                  Destino
                </p>
                <p className="mt-2 flex items-center gap-2 text-xs font-extrabold">
                  <MapPin size={14} className="shrink-0 text-[#39752b]" />
                  Paranaguá, PR
                </p>
              </div>
            </div>

            {/* Linha do tempo */}
            <div className="mt-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h3 className="text-xs font-extrabold">Etapas da entrega</h3>
                <span className="text-[10px] font-bold text-[#39752b]">
                  68% concluído
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-[12.5%] right-[12.5%] top-3.5 h-0.5 bg-[#e0e6dc]" />
                <div className="absolute left-[12.5%] top-3.5 h-0.5 w-[50%] bg-[#39752b]" />

                <div className="relative grid grid-cols-4 gap-1">
                  <DeliveryStep
                    number={1}
                    title="Aceito"
                    description="Frete confirmado"
                    completed
                  />
                  <DeliveryStep
                    number={2}
                    title="Coletado"
                    description="Carga retirada"
                    completed
                  />
                  <DeliveryStep
                    number={3}
                    title="Em trânsito"
                    description="680 km restantes"
                    active
                  />
                  <DeliveryStep
                    number={4}
                    title="Entregue"
                    description="Destino final"
                  />
                </div>
              </div>
            </div>

            {/* Informações do trajeto */}
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-[#e5eae2] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-[10px] text-[#708077]">Distância total</p>
                <p className="mt-1 text-sm font-extrabold">2.100 km</p>
              </div>
              <div>
                <p className="text-[10px] text-[#708077]">Distância restante</p>
                <p className="mt-1 text-sm font-extrabold">680 km</p>
              </div>
              <div>
                <p className="text-[10px] text-[#708077]">Velocidade média</p>
                <p className="mt-1 text-sm font-extrabold">74 km/h</p>
              </div>
              <div>
                <p className="text-[10px] text-[#708077]">Previsão de chegada</p>
                <p className="mt-1 text-sm font-extrabold">30/08 · 10h</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    'A integração de localização será implementada com o serviço de rastreamento.',
                  )
                }
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2f681f] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#245518] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                <Navigation size={15} />
                Atualizar localização
              </button>

              <button
                type="button"
                onClick={() =>
                  window.alert(
                    'A função de reportar problemas será conectada ao backend posteriormente.',
                  )
                }
                className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dce4d7] bg-white px-4 py-3 text-xs font-bold text-[#34483a] transition hover:bg-[#f7f8f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                Reportar problema
              </button>
            </div>
          </article>

          {/* Fretes disponíveis */}
          <aside
            id="fretes-disponiveis"
            className="min-w-0 rounded-2xl bg-[#193c22] p-4 text-white shadow-[0_4px_18px_rgba(16,34,23,0.07)] sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                  Oportunidades para você
                </p>
                <h2 className="mt-1 font-['Bricolage_Grotesque'] text-lg font-extrabold">
                  Novos fretes
                </h2>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-[#c1f23c]">
                <Truck size={20} />
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-white/65">
              Confira as cargas disponíveis e encontre sua próxima viagem.
            </p>

            <div className="mt-5 space-y-3">
              {availableFreights.map((freight) => (
                <article
                  key={freight.route}
                  className="rounded-xl border border-white/10 bg-white/[0.07] p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#d2f58b]">
                      <MapPin size={12} />
                      {freight.cargo}
                    </span>

                    {freight.urgent && (
                      <span className="rounded-full bg-[#f9e7b9] px-2 py-1 text-[8px] font-extrabold text-[#775019]">
                        URGENTE
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-xs font-extrabold leading-5">
                    {freight.route}
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-white/60">
                    {freight.details}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <p className="font-['Bricolage_Grotesque'] text-lg font-extrabold">
                      {freight.price}
                    </p>

                    <span className="text-[9px] text-white/60">
                      Valor do frete
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <Link
              to="/transportador/fretes-disponiveis"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#c1f23c] px-4 py-3 text-xs font-extrabold text-[#102217] transition hover:bg-[#d2f66d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Ver todos os fretes
              <ArrowRight size={15} />
            </Link>
          </aside>
        </section>

        {/* Histórico recente */}
        <section id="historico" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#708077]">
                Suas últimas entregas
              </p>
              <h2 className="mt-1 font-['Bricolage_Grotesque'] text-lg font-extrabold">
                Histórico recente
              </h2>
            </div>

            <Link
              to="/transportador/historico"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2f681f] hover:underline"
            >
              Ver histórico
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <RecentFreight
              route="Patrocínio, MG → Vitória, ES"
              cargo="Café · 18 toneladas"
              date="22/08/2026"
              price="R$ 2.600"
            />

            <RecentFreight
              route="Rio Verde, GO → São Paulo, SP"
              cargo="Milho · 25 toneladas"
              date="15/08/2026"
              price="R$ 3.800"
            />
          </div>
        </section>

        <p className="text-center text-[10px] text-[#8a978b]">
          Solum Agronegócio B2B · Painel do transportador
        </p>
      </main>
    </div>
  )
}
