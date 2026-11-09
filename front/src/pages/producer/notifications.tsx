import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, Check, CheckCheck, CheckCircle2, CircleDollarSign,
  Clock3, Handshake,   MoreHorizontal, PackageCheck,
  Tag, TrendingUp, Truck, Users,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import { useAuthStore } from "../../stores/authStore";
import { notificationService, type BackendNotification } from "../../services/notificationService";

type Category = "Negociações" | "Vendas" | "Pedidos" | "Oportunidades";
type Notice = {
  id: string;
  title: string;
  description: string;
  time: string;
  group: "Hoje" | "Anteriores";
  category: Category;
  action: string;
  link: string;
  unread: boolean;
  urgent?: boolean;
};

const navigation = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];

function toNotice(notification: BackendNotification): Notice {
  const category: Category = notification.tipo_referencia === "PROPOSTA" || notification.tipo_referencia === "CONTRA_PROPOSTA"
    ? "Negociações"
    : notification.tipo_referencia === "PEDIDO" || notification.tipo_referencia === "FRETE"
      ? "Pedidos"
      : notification.tipo_referencia === "OFERTA" ? "Oportunidades" : "Vendas";
  const link = category === "Negociações" ? "/produtor/negociacoes" : category === "Pedidos" ? "/produtor/pedidos" : "/produtor/ofertas";
  const date = new Date(notification.criado_em);
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensagem,
    time: date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    group: date.toDateString() === new Date().toDateString() ? "Hoje" : "Anteriores",
    category,
    action: category === "Negociações" ? "Ver negociação" : category === "Pedidos" ? "Acompanhar pedido" : "Ver ofertas",
    link,
    unread: !notification.lida,
    urgent: !notification.lida,
  };
}

const colors: Record<Category, string> = {
  "Negociações": "bg-[#fff1d9] text-[#b87a15]",
  "Pedidos": "bg-[#e6f2f8] text-[#36829b]",
  "Vendas": "bg-[#e5f5e9] text-[#25814c]",
  "Oportunidades": "bg-[#eaf4e4] text-[#377d40]",
};

function NoticeIcon({ category }: { category: Category }) {
  const Icon = category === "Negociações" ? Handshake : category === "Pedidos" ? Truck : category === "Vendas" ? CheckCircle2 : TrendingUp;
  return <Icon size={18} aria-hidden="true" />;
}

export default function ProducerNotificationsPage() {
  const profileName = useAuthStore((state) => state.user?.name ?? "Produtor");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    notificationService.list()
      .then((items) => setNotices(items.map(toNotice)))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar as notificações."));
  }, []);

  const unreadCount = notices.filter((notice) => notice.unread).length;
  const categories = ["Todas", "Não lidas", "Negociações", "Pedidos", "Vendas", "Oportunidades"];

  const filtered = useMemo(() => notices.filter((notice) => {
    if (filter === "Todas") return true;
    if (filter === "Não lidas") return notice.unread;
    return notice.category === filter;
  }), [notices, filter]);

  async function setReadStatus(id: string, unread: boolean) {
    if (unread) return;
    await notificationService.markRead(id);
    setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, unread: false } : notice));
    setMenuId(null);
  }

  async function markAllRead() {
    await notificationService.markAllRead();
    setNotices((current) => current.map((notice) => ({ ...notice, unread: false })));
    setMenuId(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName={profileName} role="PRODUTOR" links={navigation} notificationCount={unreadCount} notificationsHref="/produtor/notificacoes" />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <p className="mb-1 text-xs font-bold uppercase text-[#2d6922]">Área do produtor • Central de atualizações</p>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Notificações</h1>
            <p className="mt-2 text-sm text-[#78877d]">Acompanhe propostas, pedidos, vendas e ações que precisam da sua atenção.</p>
          </div>
          <button type="button" disabled={unreadCount === 0} onClick={markAllRead} className="flex items-center gap-2 rounded-xl border border-[#dce4d9] bg-white px-4 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#edf5e8]">
            <CheckCheck size={16} /> Marcar todas como lidas
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <section className="rounded-2xl border border-[#dfe6dd] bg-white p-3 shadow-sm" aria-label="Categorias de notificações">
              {categories.map((item) => {
                const count = item === "Todas" ? notices.length : item === "Não lidas" ? unreadCount : notices.filter((n) => n.category === item).length;
                return (
                  <button type="button" key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm transition-colors ${filter === item ? "bg-[#1d4818] font-bold text-white" : "text-[#526650] hover:bg-[#f2f6ef]"}`}>
                    <span className="flex items-center gap-2">
                      {item === "Todas" ? <Bell size={16} /> : item === "Não lidas" ? <Clock3 size={16} /> : item === "Negociações" ? <Handshake size={16} /> : item === "Pedidos" ? <PackageCheck size={16} /> : item === "Vendas" ? <CircleDollarSign size={16} /> : <Tag size={16} />}
                      {item}
                    </span>
                    <span className="text-xs tabular-nums">{count}</span>
                  </button>
                );
              })}
            </section>

          </aside>

          <div className="space-y-4">
            {(["Hoje", "Anteriores"] as const).map((group) => {
              const items = filtered.filter((notice) => notice.group === group);
              if (!items.length) return null;
              return (
                <section key={group} className="overflow-visible rounded-2xl border border-[#dfe6dd] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e5e9e3] px-5 py-4">
                    <div className="flex items-center gap-2"><h2 className="text-base font-extrabold">{group}</h2>{group === "Hoje" && items.some((n) => n.unread) && <span className="rounded-full bg-[#e3f5e9] px-2 py-1 text-[10px] font-bold text-[#26784c]">{items.filter((n) => n.unread).length} NÃO LIDAS</span>}</div>
                  </div>
                  <div className="divide-y divide-[#e5e9e3]">
                    {items.map((notice) => (
                      <article key={notice.id} className={`relative flex items-start gap-3 px-4 py-4 sm:px-5 ${notice.unread ? "bg-[#fcfdfb]" : ""}`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colors[notice.category]}`}><NoticeIcon category={notice.category} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold">{notice.title}</h3>
                            {notice.unread && <span className="h-2 w-2 rounded-full bg-[#a4ce31]" aria-label="Não lida" />}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#87938a]">{notice.description}</p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${colors[notice.category]}`}>{notice.urgent ? "AÇÃO NECESSÁRIA" : notice.category.toUpperCase()}</span>
                            <Link to={notice.link} onClick={() => setReadStatus(notice.id, false)} className="inline-flex items-center gap-1 text-xs font-bold text-[#1d4818] hover:underline">{notice.action} <span aria-hidden="true">→</span></Link>
                          </div>
                        </div>
                        <div className="relative flex shrink-0 items-start gap-2">
                          <span className="hidden pt-1 text-[11px] text-[#87938a] sm:block">{notice.time}</span>
                          <button type="button" aria-label={`Mais opções para ${notice.title}`} aria-expanded={menuId === notice.id} onClick={() => setMenuId((id) => id === notice.id ? null : notice.id)} className="rounded-lg p-1.5 text-[#87938a] hover:bg-[#edf3e9]"><MoreHorizontal size={18} /></button>
                          {menuId === notice.id && <div className="absolute right-0 top-9 z-20 w-48 rounded-xl border border-[#dfe6dd] bg-white p-1 shadow-xl">
                            <button
                              type="button"
                              onClick={() => setReadStatus(notice.id, !notice.unread)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-[#edf3e9]"
                            >
                              <Check size={15} />
                              {notice.unread ? "Marcar como lida" : "Marcar como não lida"}
                            </button>
                          </div>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {filtered.length === 0 && !error && <section className="rounded-2xl border border-[#dfe6dd] bg-white p-12 text-center"><Users size={28} className="mx-auto text-[#9ca99b]" /><h2 className="mt-3 font-bold">Nenhuma notificação encontrada</h2><p className="mt-1 text-sm text-[#87938a]">Não há avisos nesta categoria.</p></section>}
          </div>
        </div>
      </main>
    </div>
  );
}
