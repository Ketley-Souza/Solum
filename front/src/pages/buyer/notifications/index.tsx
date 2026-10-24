import ProfileNavbar from '../../../components/ProfileNavbar'

type Notification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  type: 'oferta' | 'pedido' | 'negociacao' | 'sistema'
}

const notifications: Notification[] = [
  { id: '1', title: 'Nova oferta compatível', body: 'AgroHorizonte publicou soja padrão exportação a R$ 132/sc em Sorriso, MT.', time: 'Agora', read: false, type: 'oferta' },
  { id: '2', title: 'Proposta aceita', body: 'Sua proposta para o lote #SLM-2841 foi aceita pelo produtor Rafael Souza.', time: '15 min atrás', read: false, type: 'negociacao' },
  { id: '3', title: 'Pedido em transporte', body: 'O pedido #SLM-9824 saiu para entrega. Previsão: 28 set, até 17h.', time: '2h atrás', read: false, type: 'pedido' },
  { id: '4', title: 'Documento disponível', body: 'A nota fiscal do pedido #SLM-9764 está disponível para download.', time: 'Ontem, 14:32', read: true, type: 'pedido' },
  { id: '5', title: 'Oferta expirando', body: 'A oferta de café arábica da Fazenda Bela Vista expira em 24h.', time: 'Ontem, 09:00', read: true, type: 'oferta' },
]

const typeLabel: Record<Notification['type'], string> = {
  oferta: 'OFERTA',
  pedido: 'PEDIDO',
  negociacao: 'NEGOCIAÇÃO',
  sistema: 'SISTEMA',
}

const typeColor: Record<Notification['type'], string> = {
  oferta: 'bg-[#e8f5ce] text-[#287a48]',
  pedido: 'bg-[#e3f2f5] text-[#34788b]',
  negociacao: 'bg-[#fff0d8] text-[#ad6a15]',
  sistema: 'bg-[#f3f0ff] text-[#6c4fd8]',
}

export default function BuyerNotificationsPage() {
  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName="João Ribeiro"
        role="COMPRADOR"
        notificationCount={unread.length}
        notificationsHref="/comprador/notificacoes"
        links={[
          { label: 'Marketplace', href: '/comprador' },
          { label: 'Meus pedidos', href: '/comprador/pedidos' },
          { label: 'Negociações', href: '/comprador/negociacao/1' },
        ]}
      />

      <main className="mx-auto max-w-[860px] px-5 pb-16 pt-9 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#287a48]">
              Conta compradora
            </p>
            <h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">
              Notificações
            </h1>
            <p className="mt-1 text-xs text-[#708077]">
              {unread.length > 0
                ? `Você tem ${unread.length} notificação${unread.length > 1 ? 'ões' : ''} não lida${unread.length > 1 ? 's' : ''}.`
                : 'Você está em dia — nenhuma notificação não lida.'}
            </p>
          </div>
          {unread.length > 0 && (
            <button className="rounded-xl border border-[#dde3da] bg-white px-4 py-2 text-xs font-bold text-[#415247] hover:bg-[#f0f4eb]">
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Não lidas */}
        {unread.length > 0 && (
          <section className="mt-7" aria-labelledby="unread-title">
            <p id="unread-title" className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#708077]">
              Não lidas · {unread.length}
            </p>
            <ul className="space-y-2">
              {unread.map(n => (
                <li key={n.id} className="flex items-start gap-4 rounded-2xl border border-[#cfe0bb] bg-white p-4 shadow-[0_4px_14px_rgba(16,34,23,.06)]">
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#287a48]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${typeColor[n.type]}`}>
                        {typeLabel[n.type]}
                      </span>
                      <strong className="text-sm font-extrabold">{n.title}</strong>
                    </div>
                    <p className="mt-1 text-xs text-[#708077]">{n.body}</p>
                    <p className="mt-2 text-[10px] font-semibold text-[#9aa79b]">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Lidas */}
        {read.length > 0 && (
          <section className="mt-8" aria-labelledby="read-title">
            <p id="read-title" className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#708077]">
              Anteriores
            </p>
            <ul className="space-y-2">
              {read.map(n => (
                <li key={n.id} className="flex items-start gap-4 rounded-2xl border border-[#e0e6dd] bg-white p-4 opacity-70">
                  <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#dde3da]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${typeColor[n.type]}`}>
                        {typeLabel[n.type]}
                      </span>
                      <strong className="text-sm font-bold">{n.title}</strong>
                    </div>
                    <p className="mt-1 text-xs text-[#708077]">{n.body}</p>
                    <p className="mt-2 text-[10px] font-semibold text-[#9aa79b]">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}
