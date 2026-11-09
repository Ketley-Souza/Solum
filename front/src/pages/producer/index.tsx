import { useEffect, useState } from "react";
import { ArrowRight, Handshake, Package, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileNavbar from "../../components/ProfileNavbar";
import { useAuthStore } from "../../stores/authStore";
import { selectMyOffers, useOfferStore } from "../../stores/offerStore";
import { selectOrders, useOrderStore } from "../../stores/orderStore";
import { proposalService, type BackendProposal } from "../../services/proposalService";
import { notificationService } from "../../services/notificationService";

const navigation = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];

const currency = (value: number) => value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProducerPage() {
  const user = useAuthStore((state) => state.user);
  const offers = useOfferStore(selectMyOffers);
  const fetchOffers = useOfferStore((state) => state.fetchMyOffers);
  const orders = useOrderStore(selectOrders);
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const [proposals, setProposals] = useState<BackendProposal[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    void fetchOffers();
    void fetchOrders();
    proposalService.list().then(setProposals).catch(() => setProposals([]));
    notificationService.list()
      .then((items) => setUnreadNotifications(items.filter((item) => !item.lida).length))
      .catch(() => setUnreadNotifications(0));
  }, [fetchOffers, fetchOrders, setProposals, setUnreadNotifications]);

  const activeOffers = offers.filter((offer) => offer.status === "ATIVA").length;
  const openProposals = proposals.filter((proposal) =>
    proposal.status === "PENDENTE" || proposal.status === "CONTRAPROPOSTA"
  );
  const negotiatedVolume = orders
    .filter((order) => order.status !== "ABERTO" && order.status !== "NEGOCIANDO")
    .reduce((total, order) => total + Number(order.preco_final) * Number(order.quantidade_final), 0);
  const recentOffers = offers.slice(0, 3);
  const latestProposal = openProposals[0];
  const firstName = user?.name?.split(" ")[0] ?? "produtor";

  return (
    <div className="min-h-screen bg-[#f7f8f3] font-['Manrope'] text-[#102217]">
      <ProfileNavbar
        profileName={user?.name ?? "Produtor"}
        role="PRODUTOR"
        links={navigation}
        notificationCount={unreadNotifications}
        notificationsHref="/produtor/notificacoes"
      />
      <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <section className="mb-7">
          <p className="mb-2 text-xs font-bold uppercase text-[#2d6922]">Área do produtor</p>
          <h1 className="text-3xl font-extrabold tracking-tight">Olá, {firstName}!</h1>
          <p className="mt-2 text-sm text-[#78877d]">Acompanhe seus lotes, negociações e pedidos em tempo real.</p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "Ofertas ativas", value: String(activeOffers), detail: `${offers.length} no total`, icon: Package },
            { title: "Negociações em andamento", value: String(openProposals.length), detail: `${proposals.filter((p) => p.status === "PENDENTE").length} aguardam você`, icon: Handshake },
            { title: "Volume negociado", value: currency(negotiatedVolume), detail: `${orders.length} pedidos`, icon: Wallet },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-[#e0e6dd] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <span className="rounded-xl bg-[#edf5e8] p-3 text-[#2d6922]"><Icon size={19} /></span>
                  <span className="rounded-full bg-[#e5f5e9] px-3 py-1 text-xs font-bold text-[#287a48]">{item.detail}</span>
                </div>
                <h2 className="text-3xl font-extrabold">{item.value}</h2>
                <p className="mt-2 text-sm font-semibold text-[#708077]">{item.title}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
          <div className="rounded-2xl border border-[#e0e6dd] bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Minhas ofertas</h2>
              <Link to="/produtor/ofertas" className="text-xs font-semibold text-[#2d6922]">Ver todas</Link>
            </div>
            {recentOffers.length === 0 ? (
              <p className="rounded-xl bg-[#f7f8f5] p-5 text-sm text-[#78877d]">Você ainda não publicou ofertas.</p>
            ) : (
              <div className="space-y-3">
                {recentOffers.map((offer) => (
                  <article key={offer.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-[#f7f8f5] p-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold">{offer.produto}</h3>
                      <p className="mt-1 text-xs text-[#78877d]">{Number(offer.quantidade)} {offer.unidade} • {offer.categoria} • {offer.localizacao}</p>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm">{currency(Number(offer.preco))}</strong>
                      <p className="text-xs text-[#78877d]">{offer.status}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-[#1d4818] p-6 text-white shadow-sm">
            <h2 className="text-xl font-extrabold">{openProposals.length} propostas em andamento</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#bdd2b9]">
              {latestProposal ? `A mais recente é de ${latestProposal.comprador.nome} para ${latestProposal.oferta.produto}.` : "Nenhuma proposta pendente no momento."}
            </p>
            {latestProposal && (
              <div className="mt-5 rounded-xl border border-white/15 bg-white/10 p-4">
                <p className="text-xs font-semibold text-[#d0f08a]">{latestProposal.comprador.nome}</p>
                <p className="mt-2 text-2xl font-extrabold">{currency(Number(latestProposal.preco))}</p>
                <p className="mt-1 text-xs text-[#bdd2b9]">{latestProposal.oferta.produto} • {latestProposal.status}</p>
              </div>
            )}
            <Link to="/produtor/negociacoes" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/20">
              <ArrowRight size={16} /> Ver negociações
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
