import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, Check, CheckCheck,
  Clock3, Handshake, PackageCheck,
  Tag, TrendingUp, Truck, Users,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";
import { useAuthStore } from "../../stores/authStore";
import { notificationService, type BackendNotification } from "../../services/notificationService";

type Category = "Negociações" | "Pedidos" | "Oportunidades" | "Outras";
type Notice = {
  id: string;
  title: string;
  description: string;
  time: string;
  group: "Hoje" | "Anteriores";
  category: Category;
  action: string;
  link: string | null;
  unread: boolean;
};

const navigation = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];

const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

function toNotice(notification: BackendNotification): Notice {
  const category: Category = notification.tipo_referencia === "PROPOSTA" || notification.tipo_referencia === "CONTRA_PROPOSTA"
    ? "Negociações"
    : notification.tipo_referencia === "PEDIDO" || notification.tipo_referencia === "FRETE"
      ? "Pedidos"
      : notification.tipo_referencia === "OFERTA" ? "Oportunidades" : "Outras";
  const link = category === "Negociações" ? "/produtor/negociacoes" : category === "Pedidos" ? "/produtor/pedidos" : category === "Oportunidades" ? "/produtor/ofertas" : null;
  const date = new Date(notification.criado_em);
  return {
    id: notification.id,
    title: notification.titulo,
    description: notification.mensagem,
    time: date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }),
    group: dayKey(date) === dayKey(new Date()) ? "Hoje" : "Anteriores",
    category,
    action: category === "Negociações" ? "Ver negociação" : category === "Pedidos" ? "Acompanhar pedido" : "Ver ofertas",
    link,
    unread: !notification.lida,
  };
}

const colors: Record<Category, string> = {
  "Negociações": "bg-[#fff1d9] text-[#b87a15]",
  "Pedidos": "bg-[#e6f2f8] text-[#36829b]",
  "Outras": "bg-[#edf1e9] text-[#526650]",
  "Oportunidades": "bg-[#eaf4e4] text-[#377d40]",
};

function NoticeIcon({ category }: { category: Category }) {
  const Icon = category === "Negociações" ? Handshake : category === "Pedidos" ? Truck : category === "Outras" ? Bell : TrendingUp;
  return <Icon size={18} aria-hidden="true" />;
}

export default function ProducerNotificationsPage() {
  const profileName = useAuthStore((state) => state.user?.name ?? "Produtor");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try { const items = await notificationService.list(); if (active) setNotices(items.map(toNotice)); }
      catch (cause) { if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar as notificações."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const unreadCount = notices.filter((notice) => notice.unread).length;
  const categories = ["Todas", "Não lidas", "Negociações", "Pedidos", "Oportunidades", "Outras"];

  const filtered = useMemo(() => notices.filter((notice) => {
    if (filter === "Todas") return true;
    if (filter === "Não lidas") return notice.unread;
    return notice.category === filter;
  }), [notices, filter]);

  async function setReadStatus(id: string) {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await notificationService.markRead(id);
      setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, unread: false } : notice));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível marcar a notificação como lida."); }
    finally { setBusy(false); }
  }

  async function markAllRead() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      await notificationService.markAllRead();
      setNotices((current) => current.map((notice) => ({ ...notice, unread: false })));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível marcar todas como lidas."); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName={profileName} role="PRODUTOR" links={navigation} notificationCount={unreadCount} notificationsHref="/produtor/notificacoes" />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Notificações</h1>
            <p className="mt-2 text-sm text-[#78877d]">Acompanhe propostas, pedidos e ações que precisam da sua atenção.</p>
          </div>
          <button type="button" disabled={busy || loading || unreadCount === 0} onClick={markAllRead} className="flex items-center gap-2 rounded-xl border border-[#dce4d9] bg-white px-4 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#edf5e8]">
            <CheckCheck size={16} /> Marcar todas como lidas
          </button>
        </div>

        <p className="mb-4 text-xs text-[#708077]">A API permite marcar como lida; reverter a leitura ainda não está disponível.</p>
        <div className="grid items-start gap-4 lg:grid-cols-[245px_minmax(0,1fr)]">
          <aside className="space-y-3">
            <section className="rounded-2xl border border-[#dfe6dd] bg-white p-3 shadow-sm" aria-label="Categorias de notificações">
              {categories.map((item) => {
                const count = item === "Todas" ? notices.length : item === "Não lidas" ? unreadCount : notices.filter((n) => n.category === item).length;
                return (
                  <button type="button" key={item} onClick={() => setFilter(item)} aria-pressed={filter === item} className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm transition-colors ${filter === item ? "bg-[#1d4818] font-bold text-white" : "text-[#526650] hover:bg-[#f2f6ef]"}`}>
                    <span className="flex items-center gap-2">
                      {item === "Todas" ? <Bell size={16} /> : item === "Não lidas" ? <Clock3 size={16} /> : item === "Negociações" ? <Handshake size={16} /> : item === "Pedidos" ? <PackageCheck size={16} /> : item === "Outras" ? <Bell size={16} /> : <Tag size={16} />}
                      {item}
                    </span>
                    <span className="text-xs tabular-nums">{loading ? "…" : count}</span>
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
                      <article key={notice.id} className={`relative flex flex-wrap items-start gap-3 px-4 py-4 sm:px-5 ${notice.unread ? "bg-[#fcfdfb]" : ""}`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${colors[notice.category]}`}><NoticeIcon category={notice.category} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-extrabold">{notice.title}</h3>
                            {notice.unread && <span className="h-2 w-2 rounded-full bg-[#a4ce31]" aria-label="Não lida" />}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-[#87938a]">{notice.description}</p>
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${colors[notice.category]}`}>{notice.category.toUpperCase()}</span>
                            {notice.link && <Link to={notice.link} className="inline-flex items-center gap-1 text-xs font-bold text-[#1d4818] hover:underline">{notice.action} <span aria-hidden="true">→</span></Link>}
                          </div>
                        </div>
                        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-end">
                          <span className="text-[11px] text-[#87938a]">{notice.time}</span>
                          {notice.unread && <button type="button" disabled={busy} onClick={() => void setReadStatus(notice.id)} className="flex items-center gap-1 rounded-lg border border-[#dfe6dd] px-2 py-1 text-xs font-semibold disabled:opacity-50"><Check size={14}/> Marcar como lida</button>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {loading && <p role="status" className="p-4 text-sm">Carregando notificações…</p>}
            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {filtered.length === 0 && !error && !loading && <section className="rounded-2xl border border-[#dfe6dd] bg-white p-12 text-center"><Users size={28} className="mx-auto text-[#9ca99b]" /><h2 className="mt-3 font-bold">Nenhuma notificação encontrada</h2><p className="mt-1 text-sm text-[#87938a]">Não há avisos nesta categoria.</p></section>}
          </div>
        </div>
      </main>
    </div>
  );
}
