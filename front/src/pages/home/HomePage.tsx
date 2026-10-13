import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import HomeNavbar from "../../components/HomeNavbar";
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
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

type Offer = [string, string, string, string, string];
const offers: Offer[] = [
  [
    "Soja Standard Tipo 1",
    "Sorriso (MT) • Cooperativa Progresso",
    "R$ 132,00",
    "Disponível: 4.000 sacas",
    sojaImage,
  ],
  [
    "Café Arábica Especial (Bebida Fina)",
    "Guaxupé (MG) • Fazenda Bela Vista",
    "R$ 980,00",
    "",
    cafeImage,
  ],
  ["Milho Safrinha Seco", "Cascavel (PR)", "R$ 64,50", "", milhoImage],
  [
    "Algodão Pluma HVI",
    "Luís Eduardo Magalhães (BA)",
    "R$ 142,00",
    "",
    algodaoImage,
  ],
];
const profiles = [
  [
    "Produtor",
    "Venda sua colheita diretamente para grandes indústrias e distribuidoras com segurança de pagamento.",
    "Anunciar Produção",
    produtorImage,
    "produtor",
  ],
  [
    "Comprador",
    "Tenha acesso a milhares de ofertas ativas com rastreabilidade garantida e negociação transparente.",
    "Explorar Ofertas",
    compradorImage,
    "comprador",
  ],
  [
    "Transportador",
    "Encontre fretes de retorno consistentes e otimize a logística da sua frota nas principais rotas agrícolas.",
    "Buscar Cargas",
    transportadorImage,
    "transportador",
  ],
];
const testimonials = [
  [
    "José Antônio",
    "Produtor Rural • Patos de Minas - MG",
    "“Antes eu dependia de dezenas de ligações e mensagens de WhatsApp pra negociar minha soja. Com a Solum, tenho visibilidade imediata e os compradores certos me encontram com rapidez e segurança.”",
    joseImage,
  ],
  [
    "Mariana Costa",
    "Diretora de Suprimentos • Cooperativa AgroMinas",
    "“A integração automática do frete com a mesa de negociação mudou totalmente nossa rotina na cooperativa. Economizamos tempo e reduzimos significativamente os custos de frete de retorno.”",
    marianaImage,
  ],
  [
    "Carlos Silva",
    "Transportador Autônomo • Frota Graneleira Regional",
    "“Consigo programar minhas rotas de retorno direto no aplicativo da Solum. Nunca mais rodei com caminhão vazio, o frete é justo e o pagamento pós-entrega é muito rápido.”",
    carlosImage,
  ],
];
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
        <select value={value} onChange={(event) => onChange?.(event.target.value)} className={`w-full cursor-pointer appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-medium normal-case outline-none transition-colors focus:ring-2 focus:ring-[#c1f23c] ${dark ? "border-[#e8efe9] bg-black/20 text-white hover:border-white" : "border-[#e3e5df] bg-white text-[#141f16] hover:border-[#a8b8a7]"}`}>{children}</select>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 shrink-0 ${dark ? "text-white" : "text-[#5e6b60]"}`} size={15} strokeWidth={2} />
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

function OfferCard({ offer, featured = false, wide = false }: { offer: Offer; featured?: boolean; wide?: boolean }) {
  const [title, place, price, detail, image] = offer;
  const purchaseHref = `/comprador?oferta=${encodeURIComponent(title)}`;
  return <article className={`group flex min-h-64 items-end rounded-3xl bg-cover bg-center p-6 text-white transition-transform duration-300 hover:-translate-y-1 ${featured ? "md:row-span-2 md:h-full md:p-8" : "md:h-full"}`} style={{ backgroundImage: `linear-gradient(0deg, rgba(11,21,12,.75), rgba(11,21,12,.08)), url(${image})` }}><div className="w-full min-w-0"><div className="flex items-end justify-between gap-3"><div className="min-w-0"><h3 className={`font-['Bricolage_Grotesque'] font-extrabold leading-tight ${featured ? "text-[28px]" : wide ? "text-[22px]" : "text-[18px]"}`}>{title}</h3><p className="mt-1 truncate text-xs text-[#e8efe9]">{place}</p></div>{(featured || wide) && <a href={purchaseHref} className={`grid shrink-0 place-items-center rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] active:scale-95 ${featured ? "size-11 bg-[#c1f23c] text-[#0b150c]" : "size-10 bg-white text-[#0b150c]"}`} aria-label={`Comprar ${title}`}><ArrowUpRight className="shrink-0" size={featured ? 18 : 16} strokeWidth={2.5} /></a>}</div><footer className="mt-3 flex items-center justify-between gap-3 border-t border-white/70 pt-3"><strong className={`${featured ? "text-lg" : "text-sm"} shrink-0 text-[#c1f23c]`}>{price} <small className="text-[11px] font-normal text-white">/ saca{featured ? " 60kg" : ""}</small></strong>{detail ? <span className="truncate text-xs text-[#c1f23c]">{detail}</span> : !featured && !wide ? <a href={purchaseHref} className="grid size-7 shrink-0 place-items-center rounded-full bg-[#c1f23c] text-[#0b150c] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] active:scale-95" aria-label={`Comprar ${title}`}><ChevronRight className="shrink-0" size={15} strokeWidth={2.5} /></a> : null}</footer></div></article>;
}

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState("Todos os Grãos e Cultivos");
  const [region, setRegion] = useState("Selecione a Localidade");
  const [commodity, setCommodity] = useState("Filtrar por Cultura");
  const [origin, setOrigin] = useState("Qualquer Localidade");
  const [priceRange, setPriceRange] = useState("Até R$ 500,00");
  const [filtersApplied, setFiltersApplied] = useState(false);
  return (
    <div className="min-w-[320px] overflow-hidden bg-[#fafaf8] font-['Manrope'] text-[#0b150c]">
      <HomeNavbar />
      <main>
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
            <div className="mt-12 max-w-213 rounded-3xl bg-[#0b150c]/25 p-6 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <SelectField label="Produto" dark value={product} onChange={(value) => { setProduct(value); setMessage(`Produto selecionado: ${value}`) }}>
                  <option>Todos os Grãos e Cultivos</option>
                  <option>Soja</option>
                  <option>Milho</option>
                  <option>Café</option>
                </SelectField>
                <SelectField label="Região de origem" dark value={region} onChange={(value) => { setRegion(value); setMessage(`Região selecionada: ${value}`) }}>
                  <option>Selecione a Localidade</option>
                  <option>Mato Grosso</option>
                  <option>Minas Gerais</option>
                </SelectField>
                <button
                  className={`${buttonClass} min-w-40 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]`}
                  onClick={() => setMessage("Mostrando ofertas populares")}
                >
                  Buscar Ofertas <Search size={16} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-[#5e6b60]">
                <b>Principais buscas:</b>
                <button className={`cursor-pointer rounded-lg px-3 py-1 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] ${product === "Café" ? "bg-[#c1f23c] text-[#0b150c]" : "bg-white/10 text-white hover:bg-white/20"}`} onClick={() => { setProduct("Café"); setMessage("Produto selecionado: Café") }}>
                  Saca de Café Arábica
                </button>
                <button className={`cursor-pointer rounded-lg px-3 py-1 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] ${product === "Milho" ? "bg-[#c1f23c] text-[#0b150c]" : "bg-white/10 text-white hover:bg-white/20"}`} onClick={() => { setProduct("Milho"); setMessage("Produto selecionado: Milho") }}>
                  Milho Safrinha
                </button>
              </div>
              {message && (
                <p className="mt-3 text-xs font-bold text-[#c1f23c]">
                  {message}
                </p>
              )}
            </div>
          </div>
        </section>
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
        <section
          id="ofertas"
          className="relative px-5 pb-20 pt-24 md:px-[5.55%] md:pt-28"
        >
          <SectionTitle
            eyebrow="Mercado Ativo"
            title="Ofertas mais populares"
          />
          <a
            className="mt-4 block text-sm font-extrabold transition-colors hover:text-[#2f681f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c] md:absolute md:right-[5.55%] md:top-32"
            href="#filtros"
          >
            <span className="inline-flex items-center gap-1.5">Ver todas as ofertas <Arrow /></span>
          </a>
          <div className="mt-10 grid gap-6 md:h-130 md:grid-cols-2 md:grid-rows-[240px_256px]">
            <OfferCard offer={offers[0]} featured />
            <div className="grid gap-6 md:h-full md:grid-rows-[240px_256px]">
              <OfferCard offer={offers[1]} wide />
              <div className="grid gap-6 sm:grid-cols-2">
                <OfferCard offer={offers[2]} />
                <OfferCard offer={offers[3]} />
              </div>
            </div>
          </div>
        </section>
        <section id="filtros" className="bg-white px-5 py-12 md:px-[5.55%]">
          <h2 className="font-['Bricolage_Grotesque'] text-[22px] font-extrabold">
            Encontre a oferta ideal
          </h2>
          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
            <SelectField label="Commodity" value={commodity} onChange={setCommodity}>
              <option>Filtrar por Cultura</option>
              <option>Todos</option>
            </SelectField>
            <SelectField label="Estado de Origem" value={origin} onChange={setOrigin}>
              <option>Qualquer Localidade</option>
              <option>Todos</option>
            </SelectField>
            <SelectField label="Faixa de Preço" value={priceRange} onChange={setPriceRange}>
              <option>Até R$ 500,00</option>
              <option>Todos</option>
            </SelectField>
            <button
              className={`${buttonClass} flex-1 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]`}
              onClick={() => { setFiltersApplied(true); setMessage(`Filtros aplicados: ${commodity}, ${origin}, ${priceRange}`) }}
            >
              Aplicar Filtros <SlidersHorizontal size={16} strokeWidth={2.5} />
            </button>
          </div>
          {filtersApplied && (
            <p className="mt-3 text-xs font-bold text-[#4a5d4e]">
              Filtros aplicados. 24 ofertas encontradas.
            </p>
          )}
        </section>
        <section id="sobre" className="px-5 pb-28 pt-20 md:px-[5.55%]">
          <SectionTitle
            eyebrow="Plataforma Multilateral"
            title="Escolha seu perfil"
          />
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
                  <p className="mb-4 text-sm leading-6 text-[#e8efe9]">
                    {text}
                  </p>
                  <a
                    className="inline-flex items-center gap-2 rounded-full bg-[#c1f23c] px-5 py-3 text-[13px] font-extrabold text-[#0b150c] transition hover:bg-[#d1fa62] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    href={`/${path}`}
                  >
                    {action} <Arrow />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="como-funciona" className="px-5 py-24 md:px-[5.55%]">
          <SectionTitle
            eyebrow="Fluxo de Negociação Simplificado"
            title="Como Funciona a Solum"
            centered
          />
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              [
                "01",
                "Cadastre seu Perfil",
                "Crie sua conta em poucos minutos como produtor, comprador ou transportador com validação de dados segura.",
              ],
              [
                "02",
                "Publique ou Busque",
                "Produtores anunciam lotes disponíveis. Compradores buscam qualidade e volumes ideais direto na plataforma.",
              ],
              [
                "03",
                "Negocie Direto",
                "Faça contrapropostas, alinhe o padrão de entrega e feche a compra digital com total amparo legal Solum.",
              ],
              [
                "04",
                "Logística Integrada",
                "Transportadores parceiros assumem a entrega e você acompanha o transporte até o destino.",
              ],
            ].map(([number, title, text]) => (
              <article key={number}>
                <strong className="block border-b border-[#bfc7bd] pb-4 font-['Bricolage_Grotesque'] text-3xl md:text-4xl">
                  {number}
                </strong>
                <h3 className="mt-4 font-['Bricolage_Grotesque'] font-extrabold">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-5 text-[#4a5d4e]">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>
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
                    <small className="block text-xs text-[#4a5d4e]">
                      {role}
                    </small>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="bg-[#1e3e0a] px-5 py-24 text-center text-white">
          <div className="mx-auto mb-6 grid size-21 place-items-center rounded-full border border-white/40">
            <img src={logoImage} alt="Logo Solum" className="size-20 brightness-0 invert" />
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
            <Link to="/cadastro" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#5fad28] px-7 py-4 font-semibold shadow-[0_12px_24px_rgba(95,173,40,.27)] transition hover:bg-[#70c43a] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">
              Criar conta grátis <Arrow />
            </Link>
            <Link to="/login" className="ml-2 inline-flex cursor-pointer items-center rounded-xl border border-white/20 bg-white/10 px-7 py-4 font-semibold transition hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">
              Explorar marketplace
            </Link>
          </div>
        </section>
      </main>
      <footer className="bg-[#0b150c] px-5 pb-12 pt-24 text-white md:px-[5.55%]">
        <div className="flex flex-col justify-between gap-16 md:flex-row">
          <div className="max-w-102.75">
            <a className="flex items-center gap-2.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" href="#inicio">
              <span className="grid size-10 place-items-center rounded-lg bg-[#c1f23c]"><img src={logoImage} alt="" className="size-10" /></span>
              <span><strong className="block font-serif text-[22px] leading-none">SOLUM</strong><small className="mt-1 block text-[9px] font-extrabold tracking-wide text-[#c1f23c]">AGRICULTURAL B2B</small></span>
            </a>
            <p className="my-6 text-sm leading-6 text-white/80">O ecossistema inteligente de comércio agrícola. Otimizando conexões, simplificando fluxos logísticos e garantindo negociações transparentes para o agronegócio nacional.</p>
            <div className="flex gap-3"><a aria-label="Instagram" href="#inicio" className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">◎</a><a aria-label="YouTube" href="#inicio" className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">▶</a><a aria-label="LinkedIn" href="#inicio" className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">in</a><a aria-label="Facebook" href="#inicio" className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]">f</a></div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 sm:gap-16">
            <FooterColumn title="Plataforma" links={["Marketplace", "Como Funciona", "Cotações do Cerrado", "Hub de Logística"]} />
            <FooterColumn title="Institucional" links={["Sobre Nós", "FAQ / Dúvidas", "Termos de Uso", "Privacidade"]} />
            <FooterColumn title="Contato & Suporte" links={["contato@solum.com.br", "(34) 99999-0000", "Patos de Minas - MG", "Falar com especialista →"]} />
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-[#182c1e] pt-8 text-xs text-white/40 md:flex-row"><span>© 2026 Solum Tecnologia Agrícola S.A. Todos os direitos reservados. Patos de Minas, Minas Gerais, Brasil.</span><span>Privacidade&nbsp;&nbsp;&nbsp; Termos Gerais</span></div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return <div><h3 className="font-['Bricolage_Grotesque'] text-[15px]">{title}</h3>{links.map((link) => <a className="mt-3 block text-[13px] text-white/60 transition-colors hover:text-white first:mt-4 last:text-[#c1f23c] last:hover:text-[#d1fa62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]" href="#inicio" key={link}>{link}</a>)}</div>
}
