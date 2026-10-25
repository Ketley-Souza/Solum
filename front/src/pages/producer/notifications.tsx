import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell, Check, CheckCheck, CheckCircle2, CircleDollarSign,
  Clock3, Handshake, Mail, MoreHorizontal, PackageCheck,
  Settings2, Tag, TrendingUp, Truck, Users, X,
} from "lucide-react";
import ProfileNavbar from "../../components/ProfileNavbar";

type Category = "Negociações" | "Vendas" | "Pedidos" | "Oportunidades";
type Notice = {
  id: number;
  title: string;
  description: string;
  time: string;
  group: "Hoje" | "Ontem";
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

const sampleNotices: Notice[] = [
  { id: 1, title: "Nova proposta recebida", description: "A Cooperativa Cerrado ofereceu R$ 1.245,00/saca pelo seu Café Arábica Especial.", time: "Há 18 min", group: "Hoje", category: "Negociações", action: "Ver negociação", link: "/produtor/negociacoes", unread: true, urgent: true },
  { id: 2, title: "Transportador ainda não definido", description: "O pedido PED-2481 aguarda a confirmação do transportador para retirada da carga.", time: "Há 1h", group: "Hoje", category: "Pedidos", action: "Acompanhar pedido", link: "/produtor/pedidos", unread: true },
  { id: 3, title: "Contraproposta respondida", description: "Armazéns Triângulo respondeu à sua condição para 480 sacas de milho.", time: "Há 3h", group: "Hoje", category: "Negociações", action: "Ver negociação", link: "/produtor/negociacoes", unread: true },
  { id: 4, title: "Pagamento confirmado", description: "O pagamento referente ao pedido PED-2459 foi confirmado.", time: "Ontem, 16:40", group: "Ontem", category: "Vendas", action: "Ver pedido", link: "/produtor/pedidos", unread: false },
  { id: 5, title: "Venda concluída", description: "A venda de Soja Standard para Alimentos Minas foi concluída.", time: "Ontem, 11:12", group: "Ontem", category: "Vendas", action: "Ver pedido", link: "/produtor/pedidos", unread: false },
  { id: 6, title: "Oportunidade para sua produção", description: "Compradores estão buscando café na região de Patos de Minas.", time: "Ontem, 09:20", group: "Ontem", category: "Oportunidades", action: "Ver ofertas", link: "/produtor/ofertas", unread: false },
];

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
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const [filter, setFilter] = useState("Todas");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [emailSummary, setEmailSummary] = useState(true);
  const [newOffers, setNewOffers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = notices.filter((notice) => notice.unread).length;
  const categories = ["Todas", "Não lidas", "Negociações", "Pedidos", "Vendas", "Oportunidades"];

  const filtered = useMemo(() => notices.filter((notice) => {
    if (filter === "Todas") return true;
    if (filter === "Não lidas") return notice.unread;
    return notice.category === filter;
  }), [notices, filter]);

  function setReadStatus(id: number, unread: boolean) {
    setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, unread } : notice));
    setMenuId(null);
  }

  function markAllRead() {
    setNotices((current) => current.map((notice) => ({ ...notice, unread: false })));
    setMenuId(null);
  }

  function removeNotice(id: number) {
    setNotices((current) => current.filter((notice) => notice.id !== id));
    setMenuId(null);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar profileName="João Ribeiro" role="PRODUTOR" links={navigation} notificationCount={unreadCount} notificationsHref="/produtor/notificacoes" />
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

            <section className="rounded-2xl bg-[#edf3e9] p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h2 className="text-sm font-extrabold">Como quer receber?</h2>
                <button type="button" onClick={() => setShowSettings((current) => !current)} aria-label="Configurar alertas" aria-expanded={showSettings} className="rounded-lg p-1 hover:bg-white/70"><Settings2 size={17} /></button>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-[#78877d]">Preferências visuais desta demonstração.</p>
              <label className="mb-3 flex cursor-pointer items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2"><Mail size={16} className="text-[#27824a]" /> Resumo por e-mail</span>
                <input type="checkbox" checked={emailSummary} onChange={(e) => setEmailSummary(e.target.checked)} className="h-4 w-4 accent-[#27824a]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                <span className="flex items-center gap-2"><TrendingUp size={16} className="text-[#27824a]" /> Novas ofertas</span>
                <input type="checkbox" checked={newOffers} onChange={(e) => setNewOffers(e.target.checked)} className="h-4 w-4 accent-[#27824a]" />
              </label>
              {showSettings && <p className="mt-3 rounded-lg bg-white/70 p-2 text-xs text-[#617165]">A configuração real de envios será ligada à API em outra etapa.</p>}
            </section>
          </aside>

          <div className="space-y-4">
            {(["Hoje", "Ontem"] as const).map((group) => {
              const items = filtered.filter((notice) => notice.group === group);
              if (!items.length) return null;
              return (
                <section key={group} className="overflow-visible rounded-2xl border border-[#dfe6dd] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e5e9e3] px-5 py-4">
                    <div className="flex items-center gap-2"><h2 className="text-base font-extrabold">{group}</h2>{group === "Hoje" && items.some((n) => n.unread) && <span className="rounded-full bg-[#e3f5e9] px-2 py-1 text-[10px] font-bold text-[#26784c]">{items.filter((n) => n.unread).length} NÃO LIDAS</span>}</div>
                    {group === "Hoje" && <button type="button" onClick={() => setShowSettings((current) => !current)} className="text-xs font-semibold text-[#2d6922]">Configurar alertas</button>}
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
                            <button type="button" onClick={() => removeNotice(notice.id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#bf4440] hover:bg-red-50"><X size={15} /> Remover aviso</button>
                          </div>}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
            {filtered.length === 0 && <section className="rounded-2xl border border-[#dfe6dd] bg-white p-12 text-center"><Users size={28} className="mx-auto text-[#9ca99b]" /><h2 className="mt-3 font-bold">Nenhuma notificação encontrada</h2><p className="mt-1 text-sm text-[#87938a]">Não há avisos nesta categoria.</p></section>}
            <p className="text-center text-xs text-[#87938a]">Dados demonstrativos: alterações de leitura e preferências não são salvas no servidor.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
