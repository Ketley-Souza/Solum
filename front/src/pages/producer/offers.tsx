
import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import ProfileNavbar from "../../components/ProfileNavbar";
import CreateOfferModal, {
  type NewOffer,
} from "./CreateOfferModal";
import EditOfferModal from "./EditOfferModal";

import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";
import sojaImage from "../../assets/offer-soja.jpg";
import algodaoImage from "../../assets/offer-algodao.jpg";

type Status =
  | "Ativa"
  | "Pausada"
  | "Encerrada"
  | "Em negociação";

type Offer = NewOffer & {
  id: number;
  proposals: string;
  status: Status;
  image: string;
};

const initialOffers: Offer[] = [
  {
    id: 1,
    product: "Café Arábica Especial",
    category: "Café",
    classification: "Bebida dura",
    harvest: "2026",
    quantity: 320,
    unit: "Sacas de 60 kg",
    price: 1280,
    location: "Patos de Minas",
    availableFrom: "2026-10-25",
    availableUntil: "2026-11-25",
    description: "Lote de café arábica da safra 2026.",
    observations: "Laudo de classificação disponível.",
    proposals: "2 novas",
    status: "Ativa",
    image: cafeImage,
  },
  {
    id: 2,
    product: "Milho Safrinha Seco",
    category: "Milho",
    classification: "Tipo 1",
    harvest: "2026",
    quantity: 480,
    unit: "Sacas de 60 kg",
    price: 66.5,
    location: "Lagoa Formosa",
    availableFrom: "2026-10-25",
    availableUntil: "2026-11-30",
    description: "Milho safrinha seco.",
    observations: "",
    proposals: "1 ativa",
    status: "Em negociação",
    image: milhoImage,
  },
  {
    id: 3,
    product: "Soja Standard Tipo 1",
    category: "Soja",
    classification: "Umidade 13%",
    harvest: "2026",
    quantity: 600,
    unit: "Sacas de 60 kg",
    price: 132,
    location: "Presidente Olegário",
    availableFrom: "2026-10-25",
    availableUntil: "2026-12-10",
    description: "Soja Standard Tipo 1.",
    observations: "",
    proposals: "Nenhuma",
    status: "Ativa",
    image: sojaImage,
  },
  {
    id: 4,
    product: "Feijão Carioca Tipo 1",
    category: "Feijão",
    classification: "Tipo 1",
    harvest: "2026",
    quantity: 180,
    unit: "Sacas de 60 kg",
    price: 238,
    location: "Patos de Minas",
    availableFrom: "2026-10-25",
    availableUntil: "2026-11-20",
    description: "Feijão carioca da safra 2026.",
    observations: "",
    proposals: "Nenhuma",
    status: "Pausada",
    image: algodaoImage,
  },
  {
    id: 5,
    product: "Café Arábica Tradicional",
    category: "Café",
    classification: "Tradicional",
    harvest: "2026",
    quantity: 200,
    unit: "Sacas de 60 kg",
    price: 980,
    location: "Patrocínio",
    availableFrom: "2026-10-25",
    availableUntil: "2026-12-15",
    description: "Café arábica tradicional.",
    observations: "",
    proposals: "Nenhuma",
    status: "Ativa",
    image: cafeImage,
  },
  {
    id: 6,
    product: "Milho Tipo 1",
    category: "Milho",
    classification: "Tipo 1",
    harvest: "2026",
    quantity: 350,
    unit: "Sacas de 60 kg",
    price: 64,
    location: "Patos de Minas",
    availableFrom: "2026-10-25",
    availableUntil: "2026-12-20",
    description: "Milho Tipo 1, safra 2026.",
    observations: "",
    proposals: "Nenhuma",
    status: "Ativa",
    image: milhoImage,
  },
];

const navigation = [
  { label: "Visão geral", href: "/produtor" },
  { label: "Ofertas", href: "/produtor/ofertas" },
  { label: "Negociações", href: "/produtor/negociacoes" },
  { label: "Pedidos", href: "/produtor/pedidos" },
];

function money(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function unitLabel(unit: string) {
  if (unit === "Sacas de 60 kg") return "sacas";
  if (unit === "Toneladas") return "toneladas";
  return "kg";
}

function priceUnit(unit: string) {
  if (unit === "Sacas de 60 kg") return "saca";
  if (unit === "Toneladas") return "tonelada";
  return "kg";
}

function getImage(category: string) {
  if (category === "Milho") return milhoImage;
  if (category === "Soja") return sojaImage;
  if (category === "Feijão") return algodaoImage;
  return cafeImage;
}

function getBadge(status: Status) {
  switch (status) {
    case "Ativa":
      return "bg-[#e3f5e9] text-[#23804b]";
    case "Pausada":
      return "bg-[#edf1e9] text-[#526650]";
    case "Em negociação":
      return "bg-[#fff0d7] text-[#a6680a]";
    case "Encerrada":
      return "bg-[#fde8e7] text-[#bf4440]";
  }
}

export default function ProducerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Todas");
  const [menuId, setMenuId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [onlyWithProposals, setOnlyWithProposals] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeCount = offers.filter(
    (offer) =>
      offer.status === "Ativa" ||
      offer.status === "Em negociação"
  ).length;

  const pausedCount = offers.filter(
    (offer) => offer.status === "Pausada"
  ).length;

  const closedCount = offers.filter(
    (offer) => offer.status === "Encerrada"
  ).length;

  const tabs = [
    { label: "Todas", count: offers.length },
    { label: "Ativas", count: activeCount },
    { label: "Pausadas", count: pausedCount },
    { label: "Encerradas", count: closedCount },
  ];

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const text =
        `${offer.product} ${offer.classification} ${offer.location}`
          .toLocaleLowerCase("pt-BR");

      const matchesSearch = text.includes(
        search.toLocaleLowerCase("pt-BR").trim()
      );

      const matchesTab =
        tab === "Todas" ||
        (tab === "Ativas" &&
          (offer.status === "Ativa" ||
            offer.status === "Em negociação")) ||
        (tab === "Pausadas" && offer.status === "Pausada") ||
        (tab === "Encerradas" && offer.status === "Encerrada");

      const matchesProposals =
        !onlyWithProposals || offer.proposals !== "Nenhuma";

      return matchesSearch && matchesTab && matchesProposals;
    });
  }, [offers, search, tab, onlyWithProposals]);

  const offerToClose =
    offers.find((offer) => offer.id === closingId) ?? null;

  const offerToEdit =
    offers.find(
      (offer) =>
        offer.id === editingId &&
        offer.status !== "Encerrada"
    ) ?? null;

  // Criar oferta
  function createOffer(data: NewOffer) {
    const newOffer: Offer = {
      ...data,
      id: Math.max(0, ...offers.map((offer) => offer.id)) + 1,
      proposals: "Nenhuma",
      status: "Ativa",
      image: getImage(data.category),
    };

    setOffers((current) => [newOffer, ...current]);
    setTab("Todas");
    setSearch("");
    setOnlyWithProposals(false);
    setShowCreateModal(false);
  }

  // Editar oferta
  function saveEditedOffer(data: NewOffer) {
    if (editingId === null) return;

    setOffers((current) =>
      current.map((offer) =>
        offer.id === editingId &&
        offer.status !== "Encerrada"
          ? {
              ...offer,
              ...data,
              image: getImage(data.category),
            }
          : offer
      )
    );

    setEditingId(null);
    setMenuId(null);
  }

  // Pausar, reativar e encerrar
  function changeStatus(id: number, status: Status) {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === id && offer.status !== "Encerrada"
          ? { ...offer, status }
          : offer
      )
    );
    setMenuId(null);
  }

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
        {/* Cabeçalho */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Minhas Ofertas
            </h1>
            <p className="mt-2 text-sm text-[#78877d]">
              Acompanhe, edite ou encerre seus lotes publicados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-[#2d6922] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4818]"
          >
            <Plus size={17} />
            Nova oferta
          </button>
        </div>

        {/* Abas e filtros */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1 rounded-xl bg-[#edf3e9] p-1">
            {tabs.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setTab(item.label);
                  setMenuId(null);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                  tab === item.label
                    ? "bg-white text-[#1d4818] shadow-sm"
                    : "text-[#748579] hover:text-[#1d4818]"
                }`}
              >
                {item.label} {item.count}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-[#dce4d9] bg-white px-3 py-2.5">
              <Search size={16} className="text-[#78877d]" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por produto"
                className="w-40 bg-transparent text-sm outline-none md:w-48"
              />
            </label>

            <button
              type="button"
              onClick={() =>
                setOnlyWithProposals((current) => !current)
              }
              aria-pressed={onlyWithProposals}
              title="Mostrar somente ofertas com propostas"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                onlyWithProposals
                  ? "border-[#2d6922] bg-[#e3f5e9]"
                  : "border-[#dce4d9] bg-white"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filtros
            </button>
          </div>
        </div>

        {/* Listagem */}
        <section className="rounded-2xl border border-[#dfe5dc] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#e5e9e3] px-5 py-5">
            <h2 className="text-sm font-bold">
              {filteredOffers.length} ofertas encontradas
            </h2>
            <span className="text-xs text-[#87938a]">
              Mais recentes primeiro
            </span>
          </div>

          {filteredOffers.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-[#78877d]">
              Nenhuma oferta encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="divide-y divide-[#e5e9e3]">
              {filteredOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="relative flex flex-wrap items-center gap-4 px-4 py-4 hover:bg-[#fafbf8] md:flex-nowrap"
                >
                  <img
                    src={offer.image}
                    alt={offer.product}
                    className="h-16 w-20 shrink-0 rounded-xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold">
                        {offer.product}
                      </h3>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-bold ${getBadge(offer.status)}`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#87938a]">
                      {offer.quantity} {unitLabel(offer.unit)}
                      {" • "}
                      {offer.classification}
                      {" • "}
                      {offer.location}
                    </p>
                  </div>

                  <div className="w-24">
                    <p className="text-[10px] uppercase text-[#87938a]">
                      Propostas
                    </p>
                    <p className="mt-1 text-xs font-bold">
                      {offer.proposals}
                    </p>
                  </div>

                  <div className="w-36">
                    <p className="text-[10px] uppercase text-[#87938a]">
                      Preço
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {money(offer.price)}/{priceUnit(offer.unit)}
                    </p>
                  </div>

                  {/* Menu de ações */}
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Ações de ${offer.product}`}
                      aria-expanded={menuId === offer.id}
                      onClick={() =>
                        setMenuId(
                          menuId === offer.id ? null : offer.id
                        )
                      }
                      className="rounded-lg bg-[#f7f8f5] p-2 text-[#5d7062] hover:bg-[#e8f0e4]"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {menuId === offer.id && (
                      <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-[#dfe5dc] bg-white p-2 shadow-xl">
                        {offer.status !== "Encerrada" ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(offer.id);
                                setMenuId(null);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#f3f6f0]"
                            >
                              Editar oferta
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                changeStatus(
                                  offer.id,
                                  offer.status === "Pausada"
                                    ? "Ativa"
                                    : "Pausada"
                                )
                              }
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-[#f3f6f0]"
                            >
                              {offer.status === "Pausada"
                                ? "Reativar publicação"
                                : "Pausar publicação"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setClosingId(offer.id);
                                setMenuId(null);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#bf4440] hover:bg-[#fff0ef]"
                            >
                              Encerrar oferta
                            </button>
                          </>
                        ) : (
                          <p className="px-3 py-2 text-xs text-[#78877d]">
                            Esta oferta foi encerrada.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Janela de criação */}
      {showCreateModal && (
        <CreateOfferModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createOffer}
        />
      )}

      {/* Janela de edição */}
      {offerToEdit && (
        <EditOfferModal
          offer={offerToEdit}
          onClose={() => setEditingId(null)}
          onSave={saveEditedOffer}
        />
      )}

      {/* Janela de encerramento */}
      {offerToClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102217]/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="close-offer-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-[#e5e9e3] p-5">
              <div>
                <h2
                  id="close-offer-title"
                  className="text-xl font-extrabold text-[#bf4440]"
                >
                  Encerrar esta oferta?
                </h2>
                <p className="mt-2 text-xs text-[#78877d]">
                  Esta ação não poderá ser desfeita.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setClosingId(null)}
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-[#e5e9e3] bg-[#f7f8f3] p-4">
                <strong className="text-sm">
                  {offerToClose.product}
                </strong>
                <p className="mt-2 text-xs text-[#78877d]">
                  {offerToClose.quantity} {unitLabel(offerToClose.unit)}
                  {" • "}
                  {money(offerToClose.price)}/{priceUnit(offerToClose.unit)}
                </p>
              </div>

              <p className="mt-4 text-xs text-[#78877d]">
                Nesta versão demonstrativa, a oferta será encerrada
                somente na página atual. Nenhum dado será enviado
                ao banco de dados.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#e5e9e3] p-5">
              <button
                type="button"
                onClick={() => setClosingId(null)}
                className="rounded-xl border border-[#dfe5dc] px-4 py-3 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  changeStatus(offerToClose.id, "Encerrada");
                  setClosingId(null);
                }}
                className="rounded-xl bg-[#bf4440] px-4 py-3 text-xs font-bold text-white"
              >
                Sim, encerrar oferta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
