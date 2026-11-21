
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShoppingBag,
  TrendingUp,
  Truck,
  X,
  RefreshCw,
} from 'lucide-react'

import ProfileNavbar from '../../../components/ProfileNavbar'
import soja from '../../../assets/offer-soja.jpg'

import type { BackendOrder, OrderStatus } from '../../../services/orderService'
import { notificationService } from '../../../services/notificationService'

import { useAuthStore } from '../../../stores/authStore'
import {
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
  useOrderStore,
} from '../../../stores/orderStore'

type Status =
  | 'Em andamento'
  | 'Negociando'
  | 'Aguardando transporte'
  | 'Concluído'
  | 'Em separação'
  | 'Cancelado'

type Order = {
  id: string
  name: string
  supplier: string
  volume: string
  total: string
  status: Status
  updated: string
  image: string
  backend: BackendOrder
}

const STATUS_LABEL: Record<OrderStatus, Status> = {
  ABERTO: 'Negociando',
  NEGOCIANDO: 'Negociando',
  FECHADO: 'Aguardando transporte',
  EM_TRANSPORTE: 'Em andamento',
  ENTREGUE: 'Concluído',
}

const brl = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

function toOrder(pedido: BackendOrder): Order {
  const backendStatus = String(pedido.status)

  const status: Status =
    backendStatus === 'CANCELADO'
      ? 'Cancelado'
      : STATUS_LABEL[pedido.status as OrderStatus] ?? 'Negociando'

  return {
    id: pedido.codigo,
    name: pedido.oferta.produto,
    supplier: pedido.oferta.produtor?.nome ?? '—',
    volume: `${Number(pedido.quantidade_final)} ${pedido.oferta.unidade}`,
    total: brl(
      Number(pedido.preco_final) * Number(pedido.quantidade_final),
    ),
    status,
    updated: new Date(pedido.atualizado_em).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
    image: pedido.oferta.imagem_url || soja,
    backend: pedido,
  }
}

const filters = [
  'Todos',
  'Em andamento',
  'Negociando',
  'Concluídos',
  'Cancelados',
] as const

type Filter = typeof filters[number]

export default function BuyerOrdersPage() {
  const [filter, setFilter] = useState<Filter>('Todos')
  const [selected, setSelected] = useState<Order | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  const user = useAuthStore((state) => state.user)

  const backendOrders = useOrderStore(selectOrders)
  const loading = useOrderStore(selectOrdersLoading)
  const error = useOrderStore(selectOrdersError)
  const fetchOrders = useOrderStore((state) => state.fetchOrders)

  const orders = useMemo(
    () => backendOrders.map(toOrder),
    [backendOrders],
  )

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // Busca a quantidade real de notificações não lidas.
  useEffect(() => {
    let active = true

    async function loadNotifications() {
      setNotificationsLoading(true)

      try {
        const notifications = await notificationService.list()

        if (active) {
          setNotificationCount(
            notifications.filter((notification) => !notification.lida).length,
          )
        }
      } catch (err) {
        console.error('Erro ao carregar notificações:', err)

        if (active) {
          setNotificationCount(0)
        }
      } finally {
        if (active) {
          setNotificationsLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      active = false
    }
  }, [])

  // Indicadores calculados com os pedidos reais.
  const inProgress = orders.filter(
    (order) =>
      order.status === 'Em andamento' ||
      order.status === 'Em separação' ||
      order.status === 'Aguardando transporte',
  ).length

  const negotiating = orders.filter(
    (order) => order.status === 'Negociando',
  ).length

  const done = orders.filter(
    (order) => order.status === 'Concluído',
  ).length

  const cancelled = orders.filter(
    (order) => order.status === 'Cancelado',
  ).length

  // Valor financeiro total dos pedidos, não volume físico.
  const negotiatedValue = orders
    .filter((order) => order.status !== 'Cancelado')
    .reduce(
      (sum, order) =>
        sum +
        Number(order.backend.preco_final) *
          Number(order.backend.quantidade_final),
      0,
    )

  // Filtragem dos pedidos.
  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filter === 'Todos') return true

      if (filter === 'Concluídos') {
        return order.status === 'Concluído'
      }

      if (filter === 'Cancelados') {
        return order.status === 'Cancelado'
      }

      if (filter === 'Em andamento') {
        return (
          order.status === 'Em andamento' ||
          order.status === 'Em separação' ||
          order.status === 'Aguardando transporte'
        )
      }

      return order.status === filter
    })
  }, [filter, orders])

  const initialLoading = loading && orders.length === 0

  const cards = [
    {
      label: 'Em andamento',
      value: String(inProgress).padStart(2, '0'),
      detail: 'Aguardando transporte ou em rota',
      icon: Truck,
      dark: true,
    },
    {
      label: 'Negociando',
      value: String(negotiating).padStart(2, '0'),
      detail: 'Propostas em andamento',
      icon: Clock3,
      dark: false,
    },
    {
      label: 'Concluídos',
      value: String(done).padStart(2, '0'),
      detail: 'Entregas finalizadas',
      icon: CheckCircle2,
      dark: false,
    },
    {
      label: 'Valor financeiro negociado',
      value: brl(negotiatedValue),
      detail: 'Soma financeira dos pedidos não cancelados',
      icon: TrendingUp,
      dark: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName={user?.name ?? 'Comprador'}
        role="COMPRADOR"
        notificationCount={notificationsLoading ? 0 : notificationCount}
        notificationsHref="/comprador/notificacoes"
        links={[
          { label: 'Marketplace', href: '/comprador' },
          { label: 'Meus pedidos', href: '/comprador/pedidos' },
        ]}
      />

      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 md:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>

            <h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">
              Meus pedidos
            </h1>

            <p className="mt-1 text-xs text-[#708077]">
              Acompanhe contratos, entregas e documentos de todas as compras
              feitas pela sua operação.
            </p>
          </div>

          <Link
            to="/comprador"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c1f23c] px-5 py-3 text-xs font-extrabold hover:bg-[#d5fa73]"
          >
            Explorar marketplace
            <ShoppingBag size={14} />
          </Link>
        </div>

        {/* Indicadores */}
        <section
          aria-label="Resumo dos pedidos"
          className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {cards.map(({ label, value, detail, icon: Icon, dark }) => (
            <div
              key={label}
              className={`min-h-36 rounded-2xl border p-5 ${
                dark
                  ? 'border-[#173b21] bg-[#173b21] text-white'
                  : 'border-[#e0e6dd] bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs ${
                    dark ? 'text-white/70' : 'text-[#708077]'
                  }`}
                >
                  {label}
                </span>

                <span
                  className={`grid size-9 place-items-center rounded-xl ${
                    dark
                      ? 'bg-white/10 text-[#c1f23c]'
                      : 'bg-[#e9f5d1] text-[#377128]'
                  }`}
                >
                  <Icon size={17} />
                </span>
              </div>

              <strong className="mt-2 block font-['Bricolage_Grotesque'] text-3xl font-extrabold">
                {initialLoading ? '...' : value}
              </strong>

              <p
                className={`mt-1 text-[11px] ${
                  dark ? 'text-white/60' : 'text-[#9aa79b]'
                }`}
              >
                {detail}
              </p>
            </div>
          ))}
        </section>

        {/* Histórico */}
        <section className="mt-9" aria-labelledby="history-title">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#708077]">
            Histórico completo
          </p>

          <h2
            id="history-title"
            className="mt-1 font-['Bricolage_Grotesque'] text-2xl font-extrabold"
          >
            Todos os pedidos
          </h2>

          {/* Filtros */}
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((item) => {
              const count =
                item === 'Todos'
                  ? orders.length
                  : item === 'Em andamento'
                    ? inProgress
                    : item === 'Negociando'
                      ? negotiating
                      : item === 'Concluídos'
                        ? done
                        : cancelled

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  className={`rounded-full border px-4 py-2 text-[11px] font-bold transition ${
                    filter === item
                      ? 'border-[#173b21] bg-[#173b21] text-white'
                      : 'border-[#e0e6dd] bg-white text-[#415247] hover:bg-[#eef2e8]'
                  }`}
                >
                  {item} {count}
                </button>
              )
            })}
          </div>

          {/* Tabela */}
          <div className="mt-4 overflow-x-auto rounded-[20px] border border-[#e0e6dd] bg-white">
            {initialLoading ? (
              <div className="space-y-4 p-8" aria-live="polite">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#708077]">
                  <RefreshCw size={16} className="animate-spin" />
                  Carregando seus pedidos...
                </div>

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-lg bg-[#eef2e8]"
                  />
                ))}
              </div>
            ) : error && orders.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm font-bold text-red-700">
                  Não foi possível carregar seus pedidos.
                </p>

                <p className="mt-2 text-xs text-[#708077]">{error}</p>

                <button
                  type="button"
                  onClick={() => void fetchOrders(true)}
                  className="mt-4 rounded-xl bg-[#173b21] px-5 py-3 text-xs font-bold text-white hover:bg-[#24552e]"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <>
                {error && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                    <span>
                      Não foi possível atualizar os pedidos. Exibindo os
                      últimos dados carregados.
                    </span>

                    <button
                      type="button"
                      onClick={() => void fetchOrders(true)}
                      className="font-bold underline"
                    >
                      Tentar novamente
                    </button>
                  </div>
                )}

                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-[#eef2e8] text-[10px] font-bold uppercase text-[#708077]">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-3 py-3">Pedido</th>
                      <th className="px-3 py-3">Volume</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Atualização</th>
                      <th className="px-3 py-3" aria-label="Detalhes" />
                    </tr>
                  </thead>

                  <tbody>
                    {visibleOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-[#e9ede7] text-xs"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={order.image}
                              alt=""
                              className="size-12 rounded-lg object-cover"
                            />

                            <div>
                              <strong className="block font-bold">
                                {order.name}
                              </strong>

                              <small className="text-[10px] text-[#708077]">
                                {order.supplier}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 font-semibold">
                          {order.id}
                        </td>

                        <td className="px-3 py-3 text-[#708077]">
                          {order.volume}
                        </td>

                        <td className="px-3 py-3 font-bold">
                          {order.total}
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] font-extrabold ${
                              order.status === 'Concluído'
                                ? 'bg-[#e2f5e7] text-[#287a48]'
                                : order.status === 'Negociando'
                                  ? 'bg-[#fff0d8] text-[#ad6a15]'
                                  : order.status === 'Cancelado'
                                    ? 'bg-red-100 text-red-700'
                                    : order.status === 'Aguardando transporte'
                                      ? 'bg-[#e8f5ce] text-[#287a48]'
                                      : 'bg-[#e3f2f5] text-[#34788b]'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-[11px] text-[#708077]">
                          {order.updated}
                        </td>

                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setSelected(order)}
                            aria-label={`Ver detalhes de ${order.name}`}
                            className="rounded-lg bg-[#f0f4eb] p-2 hover:bg-[#e1efce]"
                          >
                            <ArrowRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {visibleOrders.length === 0 && (
                  <div className="p-10 text-center">
                    <ShoppingBag
                      size={30}
                      className="mx-auto text-[#9aa79b]"
                    />

                    <p className="mt-3 text-sm font-bold text-[#415247]">
                      {filter === 'Cancelados'
                        ? 'Nenhum pedido cancelado encontrado.'
                        : orders.length === 0
                          ? 'Você ainda não possui pedidos.'
                          : 'Nenhum pedido nesta categoria.'}
                    </p>

                    <p className="mt-1 text-xs text-[#708077]">
                      {filter === 'Cancelados'
                        ? 'Os pedidos cancelados aparecerão aqui quando existirem registros desse status.'
                        : 'Quando houver pedidos disponíveis, eles aparecerão nesta seção.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {selected && (
        <OrderDetailsModal
          order={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function OrderDetailsModal({
  order,
  onClose,
}: {
  order: Order
  onClose: () => void
}) {
  const proposal = order.backend.proposta

  const stages = [
    { label: 'Aberto', active: true },
    {
      label: 'Negociando',
      active: ['NEGOCIANDO', 'FECHADO', 'EM_TRANSPORTE', 'ENTREGUE'].includes(
        String(order.backend.status),
      ),
    },
    {
      label: 'Fechado',
      active: ['FECHADO', 'EM_TRANSPORTE', 'ENTREGUE'].includes(
        String(order.backend.status),
      ),
    },
    {
      label: 'Em transporte',
      active: ['EM_TRANSPORTE', 'ENTREGUE'].includes(
        String(order.backend.status),
      ),
    },
    {
      label: 'Entregue',
      active: String(order.backend.status) === 'ENTREGUE',
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do pedido"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-[#708077]">{order.id}</p>

            <h2 className="mt-1 text-xl font-extrabold">{order.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg bg-[#eef2e8] p-2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <p>
            <span className="block text-[10px] uppercase text-[#708077]">
              Fornecedor
            </span>
            <strong>{order.supplier}</strong>
          </p>

          <p>
            <span className="block text-[10px] uppercase text-[#708077]">
              Status
            </span>
            <strong>{order.status}</strong>
          </p>

          <p>
            <span className="block text-[10px] uppercase text-[#708077]">
              Volume
            </span>
            <strong>{order.volume}</strong>
          </p>

          <p>
            <span className="block text-[10px] uppercase text-[#708077]">
              Total
            </span>
            <strong>{order.total}</strong>
          </p>

          <p className="col-span-2">
            <span className="block text-[10px] uppercase text-[#708077]">
              Entrega
            </span>
            <strong>{order.backend.endereco_entrega}</strong>
          </p>
        </div>

        {order.status === 'Cancelado' ? (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            <strong>Pedido cancelado</strong>
            <p className="mt-1 text-xs">
              Este pedido está registrado como cancelado.
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-[#f7f8f3] p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-[#708077]">
              Acompanhamento do pedido
            </p>

            <div className="mt-5 grid grid-cols-5 gap-1">
              {stages.map((stage, index) => (
                <div key={stage.label} className="relative text-center">
                  <span
                    className={`mx-auto grid size-6 place-items-center rounded-full text-[10px] font-bold ${
                      stage.active
                        ? 'bg-[#2d6922] text-white'
                        : 'bg-[#e0e6dd] text-[#708077]'
                    }`}
                  >
                    {index + 1}
                  </span>

                  <p
                    className={`mt-2 text-[9px] ${
                      stage.active
                        ? 'font-bold text-[#102217]'
                        : 'text-[#9aa79b]'
                    }`}
                  >
                    {stage.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.backend.frete && (
          <div className="mt-5 rounded-xl bg-[#eef6e9] p-4 text-sm">
            <strong>Logística</strong>

            <p className="mt-2">
              Frete {order.backend.frete.codigo} ·{' '}
              {order.backend.frete.status}
            </p>

            <p className="mt-1 text-xs text-[#708077]">
              Transportador:{' '}
              {order.backend.frete.transportador?.nome ??
                'Aguardando atribuição'}
            </p>
          </div>
        )}

        {proposal && (
          <div className="mt-5 rounded-xl border border-[#e0e6dd] p-4 text-sm">
            <strong>Negociação</strong>

            <p className="mt-2">
              Sua proposta: {brl(Number(proposal.preco))} por unidade
            </p>

            <p className="mt-3 text-xs text-[#708077]">
              Para responder ou fazer uma nova proposta, acesse a área de
              negociações.
            </p>

            <Link
              to="/comprador/negociacoes"
              onClick={onClose}
              className="mt-4 inline-flex rounded-lg bg-[#2d6922] px-4 py-2 text-xs font-bold text-white"
            >
              Ir para negociações
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
