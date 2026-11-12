import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar";
import Footer from "../../components/Footer";
import heroImage from "../../assets/hero.jpg";
import sojaImage from "../../assets/offer-soja.jpg";
import cafeImage from "../../assets/offer-cafe.png";
import milhoImage from "../../assets/offer-milho.jpg";
import algodaoImage from "../../assets/offer-algodao.jpg";
import produtorImage from "../../assets/profile-produtor.jpg";
import compradorImage from "../../assets/profile-comprador.jpg";
import transportadorImage from "../../assets/profile-transportador.png";
import joseImage from "../../assets/avatar-jose.jpg";
import marianaImage from "../../assets/avatar-mariana.png";
import carlosImage from "../../assets/avatar-carlos.jpg";
import logoImage from "../../assets/logo.svg";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import type { BackendOffer } from "../../services/offerService";
import { offerService } from "../../services/offerService";

// ─── Tipos ────────────────────────────────────────────────────────

type Offer = [string, string, string, string, string]; // [title, place, price, detail, image]

const commodityOptions = [
  "Soja",
  "Milho",
  "Café",
  "Algodão",
  "Açúcar",
  "Feijão",
];
const stateOptions = ["MT", "MG", "PR", "BA", "GO", "MS", "SP"];

function normalizeFilterValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ─── Helpers ──────────────────────────────────────────────────────

function fallbackImage(categoria: string): string {
  if (categoria === "Café") return cafeImage;
  if (categoria === "Milho") return milhoImage;
  if (categoria === "Soja") return sojaImage;
  return algodaoImage;
}

/** Score de destaque = preço × quantidade (valor total do lote). */
function score(o: BackendOffer): number {
  return Number(o.preco) * Number(o.quantidade);
}

function toOfferTuple(o: BackendOffer): Offer {
  const priceFormatted = Number(o.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const qty = Number(o.quantidade);
  const detail =
    qty > 0 ? `Disponível: ${qty.toLocaleString("pt-BR")} ${o.unidade}` : "";
  const image = o.imagem_url || fallbackImage(o.categoria);
  return [
    o.produto,
    `${o.localizacao} • ${o.produtor?.nome ?? "Produtor"}`,
    priceFormatted,
    detail,
    image,
  ];
}

// ─── Fallbacks estáticos ──────────────────────────────────────────

const FALLBACK_OFFERS: Offer[] = [
  ["Soja Standard Tipo 1", "Sorriso (MT) • Cooperativa Progresso", "R$ 132,00", "Disponível: 4.000 sacas", sojaImage],
  ["Café Arábica Especial (Bebida Fina)", "Guaxupé (MG) • Fazenda Bela Vista", "R$ 980,00", "", cafeImage],
  ["Milho Safrinha Seco", "Cascavel (PR)", "R$ 64,50", "", milhoImage],
  ["Algodão Pluma HVI", "Luís Eduardo Magalhães (BA)", "R$ 142,00", "", algodaoImage],
];

// ─── Dados estáticos ──────────────────────────────────────────────

const profiles = [
  ["Produtor", "Venda sua colheita diretamente para grandes indústrias e distribuidoras com segurança de pagamento.", "Anunciar Produção", produtorImage, "produtor"],
  ["Comprador", "Tenha acesso a milhares de ofertas ativas com rastreabilidade garantida e negociação transparente.", "Explorar Ofertas", compradorImage, "comprador"],
  ["Transportador", "Encontre fretes de retorno consistentes e otimize a logística da sua frota nas principais rotas agrícolas.", "Buscar Cargas", transportadorImage, "transportador"],
];

const testimonials: [string, string, string, string][] = [
  ["José Antônio", "Produtor Rural • Patos de Minas - MG", "\u201cAntes eu dependia de dezenas de ligações e mensagens de WhatsApp pra negociar minha soja. Com a Solum, tenho visibilidade imediata e os compradores certos me encontram com rapidez e segurança.\u201d", joseImage],
  ["Mariana Costa", "Diretora de Suprimentos • Cooperativa AgroMinas", "\u201cA integração automática do frete com a mesa de negociação mudou totalmente nossa rotina na cooperativa. Economizamos tempo e reduzimos significativamente os custos de frete de retorno.\u201d", marianaImage],
  ["Carlos Silva", "Transportador Autônomo • Frota Graneleira Regional", "\u201cConsigo programar minhas rotas de retorno direto no aplicativo da Solum. Nunca mais rodei com caminhão vazio, o frete é justo e o pagamento pós-entrega é muito rápido.\u201d", carlosImage],
];

// ─── Componentes auxiliares ───────────────────────────────────────

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#c1f23c] px-6 py-4 text-sm font-extrabold text-[#0b150c] transition hover:bg-[#d1fa62]";

function Arrow() {
  return <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" />;
}

function SelectField({
  label,
  dark = false,
  value,
  onChange,
  children,
}: {
  label: string;
  dark?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex flex-1 flex-col gap-1.5 text-[11px] font-extrabold uppercase ${dark ? "text-[#e8efe9]" : "text-[#5e6b60]"}`}
    >
      <span>{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full cursor-pointer appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium normal-case outline-none transition-colors focus:ring-2 focus:ring-[#c1f23c] ${dark ? "border-[#e8efe9] bg-black/20 text-white hover:border-white" : "border-[#e3e5df] bg-white text-[#141f16] hover:border-[#a8b8a7]"}`}
        >
          {children}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 shrink-0 ${dark ? "text-white" : "text-[#5e6b60]"}`}
          size={15}
          strokeWidth={2}
        />
      </span>
    </label>
  );
}

function SectionTitle({
  eyebrow,
  title,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : ""}>
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#5e6b60]">
        {eyebrow}
      </span>
      <h2 className="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold leading-tight md:text-4xl">
        {title}
      </h2>
    </div>
  );
}

/** Card de oferta — link vai para /login (usuário precisa de conta para negociar). */
function OfferCard({
  offer,
  featured = false,
  wide = false,
  loginHint = false,
}: {
  offer: Offer;
  featured?: boolean;
  wide?: boolean;
  /** Quando true, o botão leva para /cadastro em vez de um deeplink privado. */
  loginHint?: boolean;
}) {
  const [title, place, price, detail, image] = offer;
  const href = loginHint ? "/cadastro" : `/login`;

  return (
    <article
      className={`group flex min-h-64 items-end rounded-3xl bg-cover bg-center p-6 text-white transition-transform duration-300 hover:-translate-y-1 ${featured ? "md:row-span-2 md:h-full md:p-8" : "md:h-full"}`}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(11,21,12,.75), rgba(11,21,12,.08)), url(${image})`,
      }}
    >
      <div className="w-full min-w-0">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3
              className={`font-['Bricolage_Grotesque'] font-extrabold leading-tight ${featured ? "text-[28px]" : wide ? "text-[22px]" : "text-[18px]"}`}
            >
              {title}
            </h3>
            <p className="mt-1 truncate text-xs text-[#e8efe9]">{place}</p>
          </div>
          {(featured || wide) && (
            <Link
              to={href}
              className={`grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] active:scale-95 ${featured ? "size-11 bg-[#c1f23c] text-[#0b150c]" : "size-10 bg-white text-[#0b150c]"}`}
              aria-label={`Ver oferta: ${title}`}
            >
              <ArrowUpRight
                className="shrink-0"
                size={featured ? 18 : 16}
                strokeWidth={2.5}
              />
            </Link>
          )}
        </div>
        <footer className="mt-3 flex items-center justify-between gap-3 border-t border-white/70 pt-3">
          <strong
            className={`${featured ? "text-lg" : "text-sm"} shrink-0 text-[#c1f23c]`}
          >
            {price}{" "}
            <small className="text-[11px] font-normal text-white">
              / saca{featured ? " 60kg" : ""}
            </small>
          </strong>
          {detail ? (
            <span className="truncate text-xs text-[#c1f23c]">{detail}</span>
          ) : !featured && !wide ? (
            <Link
              to={href}
              className="grid size-7 shrink-0 place-items-center rounded-full bg-[#c1f23c] text-[#0b150c] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] active:scale-95"
              aria-label={`Ver oferta: ${title}`}
            >
              <ChevronRight className="shrink-0" size={15} strokeWidth={2.5} />
            </Link>
          ) : null}
        </footer>
      </div>
    </article>
  );
}

/** Card compacto usado na grade de resultados de busca. */
function SearchResultCard({ offer }: { offer: BackendOffer }) {
  const price = Number(offer.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const image = offer.imagem_url || fallbackImage(offer.categoria);

  return (
    <article className="flex gap-4 overflow-hidden rounded-2xl border border-[#e3e5df] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={image}
        alt={offer.produto}
        className="h-20 w-24 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5e6b60]">
          {offer.categoria} · Safra {offer.safra}
        </p>
        <h3 className="mt-1 truncate font-['Bricolage_Grotesque'] text-base font-extrabold">
          {offer.produto}
        </h3>
        <p className="mt-0.5 truncate text-xs text-[#5e6b60]">
          {offer.localizacao} · {offer.produtor?.nome ?? "Produtor"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <strong className="text-lg font-extrabold text-[#2f681f]">
            {price}
            <span className="ml-1 text-xs font-normal text-[#5e6b60]">
              / {offer.unidade}
            </span>
          </strong>
          <Link
            to="/login"
            className="rounded-lg bg-[#c1f23c] px-3 py-1.5 text-xs font-extrabold text-[#0b150c] transition hover:bg-[#d1fa62]"
          >
            Negociar
          </Link>
        </div>
      </div>
    </article>
  );
}

// ─── Componente principal ─────────────────────────────────────────

export default function HomePage() {
  // ── Ofertas carregadas da API (pública — sem token) ────────────
  const [backendOffers, setBackendOffers] = useState<BackendOffer[]>([]);

  useEffect(() => {
    offerService
      .listActive()
      .then(setBackendOffers)
      .catch(() => setBackendOffers([]));
  }, []);

  // ── Top 4 por score (preço × quantidade) ──────────────────────
  const featuredOffers: Array<{ tuple: Offer }> = useMemo(() => {
    const sorted = [...backendOffers]
      .sort((a, b) => score(b) - score(a))
      .slice(0, 4);
    const fromBank = sorted.map((o) => ({ tuple: toOfferTuple(o) }));
    const needed = 4 - fromBank.length;
    const fallbacks = FALLBACK_OFFERS.slice(0, needed).map((tuple) => ({
      tuple,
    }));
    return [...fromBank, ...fallbacks];
  }, [backendOffers]);

  // ── Estado: filtros avançados ──────────────────────────────────
  const [commodity, setCommodity] = useState("Filtrar por Cultura");
  const [origin, setOrigin] = useState("Qualquer Localidade");
  const [filtersApplied, setFiltersApplied] = useState(false);

  // ── Resultados dos filtros avançados ───────────────────────────
  const filterResults = useMemo(() => {
    if (!filtersApplied) return [];
    return backendOffers.filter((o) => {
      const selectedCommodity = normalizeFilterValue(commodity);
      const selectedState = normalizeFilterValue(origin);
      const location = normalizeFilterValue(o.localizacao);
      const matchCommodity =
        commodity === "Filtrar por Cultura" ||
        normalizeFilterValue(o.categoria).includes(selectedCommodity) ||
        normalizeFilterValue(o.produto).includes(selectedCommodity);
      const matchOrigin =
        origin === "Qualquer Localidade" ||
        new RegExp(`(^|[^a-z])${selectedState}([^a-z]|$)`).test(location);
      return matchCommodity && matchOrigin;
    });
  }, [filtersApplied, commodity, origin, backendOffers]);

  // ── Handlers ──────────────────────────────────────────────────
  function handleFilterApply() {
    setFiltersApplied(true);
  }

  return (
    <div className="min-w-[320px] overflow-hidden bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">
      <HomeNavbar />
      <main>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <section
          id="inicio"
          className="min-h-170 bg-cover bg-center px-5 pb-24 pt-16 text-white md:px-[5.55%] md:pt-20"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(11,21,12,.78), rgba(11,21,12,.35)), url(${heroImage})`,
          }}
        >
          <div className="max-w-213">
            <span className="inline-block rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#c1f23c]">
              REVOLUCIONANDO O AGRO B2B •
            </span>
            <h1 className="mt-6 max-w-200 font-['Bricolage_Grotesque'] text-[clamp(34px,8vw,64px)] font-extrabold leading-[1.05] tracking-[-1.5px]">
              Conectamos quem produz, quem compra e quem transporta
            </h1>
            <p className="mt-4 max-w-180 text-lg leading-7 text-white/80">
              O marketplace B2B inteligente que integra toda a cadeia do
              agronegócio em um só lugar. Segurança, transparência e eficiência
              do campo ao destino.
            </p>
            <div className="mt-12 flex h-24 flex-wrap items-start gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center justify-center rounded-xl bg-[#c1f23c] px-6 py-4 text-sm font-extrabold text-[#0b150c] shadow-[0_12px_24px_rgba(193,242,60,.2)] transition hover:bg-[#d1fa62] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                Faça parte da Solum
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:border-white hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                Já tenho uma conta
              </Link>
            </div>
          </div>
        </section>

        {/* ── INDICADORES ────────────────────────────────────────── */}
        <div className="relative z-10 mx-5 -mt-9 flex flex-wrap items-center gap-6 rounded-3xl border border-[#e3e5df] bg-[#e4f2be] p-6 shadow-[0_8px_12px_rgba(0,0,0,.07)] md:mx-[5.55%] md:justify-between md:p-8">
          {[
            ["12.500+ t", "Toneladas Negociadas"],
            ["1.200+", "Produtores e Compradores"],
            ["14", "Estados Atendidos"],
          ].map(([value, label]) => (
            <div className="flex flex-col gap-1" key={label}>
              <strong className="font-['Bricolage_Grotesque'] text-3xl">
                {value}
              </strong>
              <span className="whitespace-nowrap text-xs font-semibold text-[#5e6b60]">
                {label}
              </span>
            </div>
          ))}
          <p className="max-w-sm text-[13px] leading-5">
            Conecte sua fazenda aos principais hubs de distribuição do país com
            segurança e contratos auditados.
          </p>
        </div>

        {/* ── OFERTAS MAIS POPULARES ──────────────────────────────── */}
        <section
          id="ofertas"
          className="relative px-5 pb-20 pt-24 md:px-[5.55%] md:pt-28"
        >
          <SectionTitle eyebrow="Mercado Ativo" title="Ofertas mais populares" />
          <button
            className="mt-4 block text-sm font-extrabold transition-colors hover:text-[#2f681f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] md:absolute md:right-[5.55%] md:top-32"
            onClick={() => {
              document
                .getElementById("filtros")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              Ver todas as ofertas <Arrow />
            </span>
          </button>
          <div className="mt-10 grid gap-6 md:h-130 md:grid-cols-2 md:grid-rows-[240px_256px]">
            <OfferCard offer={featuredOffers[0].tuple} featured loginHint />
            <div className="grid gap-6 md:h-full md:grid-rows-[240px_256px]">
              <OfferCard offer={featuredOffers[1].tuple} wide loginHint />
              <div className="grid gap-6 sm:grid-cols-2">
                <OfferCard offer={featuredOffers[2].tuple} loginHint />
                <OfferCard offer={featuredOffers[3].tuple} loginHint />
              </div>
            </div>
          </div>
        </section>

        {/* ── ENCONTRE A OFERTA IDEAL ─────────────────────────────── */}
        <section id="filtros" className="bg-white px-5 py-12 md:px-[5.55%]">
          <h2 className="font-['Bricolage_Grotesque'] text-[22px] font-extrabold">
            Encontre a oferta ideal
          </h2>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
            <SelectField
              label="Commodity"
              value={commodity}
              onChange={(v) => {
                setCommodity(v);
                setFiltersApplied(false);
              }}
            >
              <option>Filtrar por Cultura</option>
              {commodityOptions.map((commodityOption) => (
                <option key={commodityOption}>{commodityOption}</option>
              ))}
            </SelectField>
            <SelectField
              label="Estado de Origem"
              value={origin}
              onChange={(v) => {
                setOrigin(v);
                setFiltersApplied(false);
              }}
            >
              <option>Qualquer Localidade</option>
              {stateOptions.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </SelectField>
            <button
              className={`${buttonClass} flex-1 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]`}
              onClick={handleFilterApply}
            >
              Aplicar Filtros <SlidersHorizontal size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Resultados inline — sem redirecionar para rota protegida */}
          <div>
            {filtersApplied && (
              <div className="mt-8">
                <p className="text-sm font-bold text-[#4a5d4e]">
                  {filterResults.length > 0
                    ? `${filterResults.length} oferta${filterResults.length > 1 ? "s" : ""} encontrada${filterResults.length > 1 ? "s" : ""}`
                    : "Nenhuma oferta encontrada para os filtros selecionados."}
                </p>
                {filterResults.length > 0 && (
                  <>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {filterResults.map((o) => (
                        <SearchResultCard key={o.id} offer={o} />
                      ))}
                    </div>
                    <p className="mt-6 text-xs text-[#5e6b60]">
                      Para negociar,{" "}
                      <Link
                        to="/login"
                        className="font-bold text-[#2f681f] underline"
                      >
                        entre na sua conta
                      </Link>{" "}
                      ou{" "}
                      <Link
                        to="/cadastro"
                        className="font-bold text-[#2f681f] underline"
                      >
                        crie uma gratuitamente
                      </Link>
                      .
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── PERFIS ─────────────────────────────────────────────── */}
        <section id="sobre" className="px-5 pb-28 pt-20 md:px-[5.55%]">
          <SectionTitle eyebrow="Plataforma Multilateral" title="Escolha seu perfil" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {profiles.map(([title, text, action, image, path]) => (
              <article
                className="flex min-h-85 items-end rounded-3xl bg-cover bg-center p-8 text-white md:min-h-100"
                key={title}
                style={{
                  backgroundImage: `linear-gradient(0deg, rgba(11,21,12,.78), rgba(11,21,12,.08)), url(${image})`,
                }}
              >
                <div>
                  <h3 className="font-['Bricolage_Grotesque'] text-2xl font-extrabold md:text-[28px]">
                    {title}
                  </h3>
                  <p className="mb-4 text-sm leading-6 text-[#e8efe9]">{text}</p>
                  <Link
                    className="inline-flex items-center gap-2 rounded-full bg-[#c1f23c] px-5 py-3 text-[13px] font-extrabold text-[#0b150c] transition hover:bg-[#d1fa62] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    to={`/${path}`}
                  >
                    {action} <Arrow />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── COMO FUNCIONA ───────────────────────────────────────── */}
        <section id="como-funciona" className="px-5 py-24 md:px-[5.55%]">
          <SectionTitle
            eyebrow="Fluxo de Negociação Simplificado"
            title="Como Funciona a Solum"
            centered
          />
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              ["01", "Cadastre seu Perfil", "Crie sua conta em poucos minutos como produtor, comprador ou transportador com validação de dados segura."],
              ["02", "Publique ou Busque", "Produtores anunciam lotes disponíveis. Compradores buscam qualidade e volumes ideais direto na plataforma."],
              ["03", "Negocie Direto", "Faça contrapropostas, alinhe o padrão de entrega e feche a compra digital com total amparo legal Solum."],
              ["04", "Logística Integrada", "Transportadores parceiros assumem a entrega e você acompanha o transporte até o destino."],
            ].map(([number, title, text]) => (
              <article key={number}>
                <strong className="block border-b border-[#bfc7bd] pb-4 font-['Bricolage_Grotesque'] text-3xl md:text-4xl">
                  {number}
                </strong>
                <h3 className="mt-4 font-['Bricolage_Grotesque'] font-extrabold">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-[#4a5d4e]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── DEPOIMENTOS ────────────────────────────────────────── */}
        <section className="border-y border-[#e3e5df] bg-white px-5 py-20 md:px-[5.55%]">
          <SectionTitle
            eyebrow="Histórias de Sucesso Reais"
            title="O que dizem os nossos parceiros"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map(([name, role, quote, image]) => (
              <article className="rounded-3xl bg-[#fafaf8] p-8" key={name}>
                <div className="tracking-[3px] text-[#a7cf29]">★★★★★</div>
                <p className="my-6 text-sm leading-[1.6]">{quote}</p>
                <div className="flex items-center gap-3">
                  <img
                    className="size-12 rounded-full object-cover"
                    src={image}
                    alt=""
                  />
                  <span>
                    <strong className="block font-['Bricolage_Grotesque'] text-sm">
                      {name}
                    </strong>
                    <small className="block text-xs text-[#4a5d4e]">{role}</small>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="bg-[#1e3e0a] px-5 py-24 text-center text-white">
          <div className="mx-auto mb-6 grid size-21 place-items-center rounded-full border border-white/40">
            <img
              src={logoImage}
              alt="Logo Solum"
              className="size-20 brightness-0 invert"
            />
          </div>
          <h2 className="font-serif text-[clamp(34px,8vw,60px)] leading-tight">
            Pronto para o campo
            <br />
            digital?
          </h2>
          <p className="mx-auto my-5 max-w-xl text-[#8eaf78]">
            Junte-se a mais de 5.000 profissionais que já negociam na Solum.
            Grátis para começar.
          </p>
          <div>
            <Link
              to="/cadastro"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#5fad28] px-7 py-4 font-semibold shadow-[0_12px_24px_rgba(95,173,40,.27)] transition hover:bg-[#70c43a] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
            >
              Criar conta grátis <Arrow />
            </Link>
            <Link
              to="/login"
              className="ml-2 inline-flex cursor-pointer items-center rounded-xl border border-white/20 bg-white/10 px-7 py-4 font-semibold transition hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
            >
              Explorar marketplace
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
