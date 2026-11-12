import { useEffect, useState } from "react";
import { ArrowRight, Handshake, Package, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import ProfileNavbar from "../../components/ProfileNavbar";
import { useAuthStore } from "../../stores/authStore";
import { selectMyOffers, useOfferStore } from "../../stores/offerStore";
import { selectOrders, useOrderStore } from "../../stores/orderStore";
import { proposalService, type BackendProposal } from "../../services/proposalService";
import { notificationService } from "../../services/notificationService";
import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";
import sojaImage from "../../assets/offer-soja.jpg";
import algodaoImage from "../../assets/offer-algodao.jpg";

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

function getOfferImage(category: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  if (category === "Milho") return milhoImage;
  if (category === "Soja") return sojaImage;
  if (category === "Feijão") return algodaoImage;
  return cafeImage;
}

function getStatusBadge(status: "Ativa" | "Em negociação" | "Encerrada") {
  if (status === "Em negociação") return "bg-[#fff0d7] text-[#a6680a]";
  if (status === "Encerrada") return "bg-[#fde8e7] text-[#bf4440]";
  return "bg-[#e3f5e9] text-[#23804b]";
}

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

  const openProposals = proposals.filter((proposal) =>
    proposal.status === "PENDENTE" || proposal.status === "CONTRAPROPOSTA"
  );
  const receivedProposals = (offerId: string) => proposals.filter((proposal) =>
    proposal.oferta.id === offerId &&
    (proposal.status === "PENDENTE" || proposal.status === "CONTRAPROPOSTA" || proposal.status === "ACEITA")
  );
  const getDashboardStatus = (offer: typeof offers[number]) => {
    if (offer.status === "ENCERRADA") return "Encerrada" as const;
    if (receivedProposals(offer.id).length > 0) return "Em negociação" as const;
    return "Ativa" as const;
  };
  const activeOffers = offers.filter((offer) => getDashboardStatus(offer) === "Ativa").length;
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
                  (() => {
                    const offerProposals = receivedProposals(offer.id);
                    const dashboardStatus = getDashboardStatus(offer);
                    return (
                  <article key={offer.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-[#FAFBF8] p-4">
                    <img
                      src={getOfferImage(offer.categoria, offer.imagem_url)}
                      alt={`Imagem de ${offer.produto}`}
                      className="h-14 w-17 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold">{offer.produto}</h3>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusBadge(dashboardStatus)}`}>
                          {dashboardStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#78877d]">
                        {Number(offer.quantidade)} {offer.unidade} • {offer.categoria} • {offer.localizacao}
                        {offerProposals.length > 0 && ` • ${offerProposals.length} ${offerProposals.length === 1 ? "proposta recebida" : "propostas recebidas"}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm">{currency(Number(offer.preco))}</strong>
                      <p className="text-xs text-[#78877d]">por {offer.unidade === "Sacas de 60 kg" ? "saca" : offer.unidade.toLowerCase()}</p>
                    </div>
                  </article>
                    );
                  })()
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
