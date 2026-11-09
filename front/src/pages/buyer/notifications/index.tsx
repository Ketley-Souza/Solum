import { useEffect, useMemo, useState } from "react";
import ProfileNavbar from "../../../components/ProfileNavbar";
import { notificationService, type BackendNotification } from "../../../services/notificationService";

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "oferta" | "pedido" | "negociacao" | "sistema";
};

function toNotification(item: BackendNotification): Notification {
  const type = item.tipo_referencia === "OFERTA"
    ? "oferta"
    : item.tipo_referencia === "PEDIDO" || item.tipo_referencia === "FRETE"
      ? "pedido"
      : item.tipo_referencia === "PROPOSTA" || item.tipo_referencia === "CONTRA_PROPOSTA"
        ? "negociacao"
        : "sistema";
  return {
    id: item.id,
    title: item.titulo,
    body: item.mensagem,
    time: new Date(item.criado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }),
    read: item.lida,
    type,
  };
}

const typeLabel: Record<Notification["type"], string> = {
  oferta: "OFERTA",
  pedido: "PEDIDO",
  negociacao: "NEGOCIAÇÃO",
  sistema: "SISTEMA",
};

const typeColor: Record<Notification["type"], string> = {
  oferta: "bg-[#e8f5ce] text-[#287a48]",
  pedido: "bg-[#e3f2f5] text-[#34788b]",
  negociacao: "bg-[#fff0d8] text-[#ad6a15]",
  sistema: "bg-[#f3f0ff] text-[#6c4fd8]",
};

export default function BuyerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    notificationService.list()
      .then((items) => setNotifications(items.map(toNotification)))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Não foi possível carregar as notificações."));
  }, []);

  const unread = useMemo(() => notifications.filter((item) => !item.read), [notifications]);
  const read = useMemo(() => notifications.filter((item) => item.read), [notifications]);

  async function markAllRead() {
    await notificationService.markAllRead();
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }

  async function markRead(id: string) {
    await notificationService.markRead(id);
    setNotifications((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName="Usuário" role="COMPRADOR" notificationCount={unread.length} notificationsHref="/comprador/notificacoes" links={[
        { label: "Marketplace", href: "/comprador" },
        { label: "Meus pedidos", href: "/comprador/pedidos" },
      ]} />
      <main className="mx-auto max-w-[860px] px-5 pb-16 pt-9 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#287a48]">Conta compradora</p>
            <h1 className="mt-1 font-['Bricolage_Grotesque'] text-3xl font-extrabold">Notificações</h1>
            <p className="mt-1 text-xs text-[#708077]">{unread.length ? `Você tem ${unread.length} notificação${unread.length > 1 ? "ões" : ""} não lida${unread.length > 1 ? "s" : ""}.` : "Você está em dia — nenhuma notificação não lida."}</p>
          </div>
          {unread.length > 0 && <button type="button" onClick={() => void markAllRead()} className="rounded-xl border border-[#dde3da] bg-white px-4 py-2 text-xs font-bold text-[#415247] hover:bg-[#f0f4eb]">Marcar todas como lidas</button>}
        </div>
        {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {unread.length > 0 && <section className="mt-7" aria-labelledby="unread-title"><p id="unread-title" className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#708077]">Não lidas · {unread.length}</p><ul className="space-y-2">{unread.map((item) => <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-[#cfe0bb] bg-white p-4 shadow-[0_4px_14px_rgba(16,34,23,.06)]"><span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#287a48]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${typeColor[item.type]}`}>{typeLabel[item.type]}</span><strong className="text-sm font-extrabold">{item.title}</strong></div><p className="mt-1 text-xs text-[#708077]">{item.body}</p><div className="mt-2 flex items-center justify-between"><p className="text-[10px] font-semibold text-[#9aa79b]">{item.time}</p><button type="button" onClick={() => void markRead(item.id)} className="text-xs font-bold text-[#1d4818] hover:underline">Marcar como lida</button></div></div></li>)}</ul></section>}
        {read.length > 0 && <section className="mt-8" aria-labelledby="read-title"><p id="read-title" className="mb-3 text-[10px] font-bold uppercase tracking-wide text-[#708077]">Anteriores</p><ul className="space-y-2">{read.map((item) => <li key={item.id} className="flex items-start gap-4 rounded-2xl border border-[#e0e6dd] bg-white p-4 opacity-70"><span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#dde3da]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${typeColor[item.type]}`}>{typeLabel[item.type]}</span><strong className="text-sm font-bold">{item.title}</strong></div><p className="mt-1 text-xs text-[#708077]">{item.body}</p><p className="mt-2 text-[10px] font-semibold text-[#9aa79b]">{item.time}</p></div></li>)}</ul></section>}
        {!error && notifications.length === 0 && <p className="mt-8 rounded-2xl border border-[#e0e6dd] bg-white p-10 text-center text-sm text-[#708077]">Nenhuma notificação recebida.</p>}
      </main>
    </div>
  );
}
