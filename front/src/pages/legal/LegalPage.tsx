import { ArrowLeft, Printer } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../../assets/logo.svg";
import Footer from "../../components/Footer";
import { LEGAL_DOCUMENTS, LEGAL_INFO, LEGAL_SLUGS, type LegalSlug } from "./content";
import LegalDocument from "./LegalDocument";

export default function LegalPage({ slug }: { slug: LegalSlug }) {
  const doc = LEGAL_DOCUMENTS[slug];
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${doc.title} · ${LEGAL_INFO.platform}`;
    window.scrollTo({ top: 0 });
    return () => {
      document.title = previousTitle;
    };
  }, [doc.title]);

  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate("/"));

  const meta = [
    ["Versão", LEGAL_INFO.version],
    ["Vigência", LEGAL_INFO.effectiveDate],
    ["Última atualização", LEGAL_INFO.updatedAt],
  ];

  return (
    <div className="min-h-screen bg-[#f3f8f0] font-['Manrope'] text-[#0b150c]">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#e3e5df] bg-white/95 px-5 backdrop-blur md:px-[5.55%] print:hidden">
        <Link
          to="/"
          aria-label="Solum, página inicial"
          className="flex items-center gap-2.5 text-[#15371e] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
        >
          <img src={logoImage} alt="" className="size-9" />
          <span>
            <strong className="block font-serif text-xl leading-none">SOLUM</strong>
            <small className="mt-1 block text-[9px] font-extrabold tracking-wide text-[#4a5d4e]">AGRICULTURAL B2B</small>
          </span>
        </Link>
        <button
          type="button"
          onClick={goBack}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#15371e] px-4 py-2.5 text-[13px] font-bold text-[#15371e] transition-[background-color,transform] duration-300 hover:bg-[#eef5e8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
        >
          <ArrowLeft size={15} strokeWidth={2.25} aria-hidden="true" /> Voltar
        </button>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#0b150c] px-5 pb-24 pt-14 text-white md:px-[5.55%] print:overflow-visible print:bg-white print:px-0 print:pb-6 print:pt-0 print:text-[#0b150c]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,rgba(193,242,60,.16),transparent_42%),radial-gradient(circle_at_0%_100%,rgba(82,139,88,.28),transparent_40%)] print:hidden"
          />
          <div className="relative mx-auto max-w-[1200px]">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[.16em] text-white backdrop-blur-sm print:border-[#cbd8c9] print:bg-transparent print:text-[#2f681f]">
              <span className="size-1.5 rounded-full bg-[#c1f23c] print:bg-[#2f681f]" /> Documento legal
            </span>

            <h1 className="mt-5 font-['Bricolage_Grotesque'] text-[clamp(30px,4vw,48px)] font-extrabold leading-[1.08]">{doc.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 print:text-[#3a4d3d]">{doc.subtitle}</p>

            <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-3 text-[13px]">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[10px] font-extrabold uppercase tracking-[.12em] text-white/50 print:text-[#7a8c7e]">{label}</dt>
                  <dd className="mt-0.5 font-bold text-[#c1f23c] print:text-[#0b150c]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3 print:hidden">
              <div role="group" aria-label="Documentos legais" className="inline-flex rounded-2xl bg-white/10 p-1">
                {LEGAL_SLUGS.map((item) => (
                  <Link
                    key={item}
                    to={`/${item}`}
                    aria-current={item === slug ? "page" : undefined}
                    className={[
                      "rounded-xl px-4 py-2.5 text-[13px] font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]",
                      item === slug ? "bg-white text-[#0f1f12] shadow-sm" : "text-white/70 hover:text-white",
                    ].join(" ")}
                  >
                    {LEGAL_DOCUMENTS[item].title}
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 px-4 py-2.5 text-[13px] font-extrabold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c1f23c]"
              >
                <Printer size={15} strokeWidth={2} aria-hidden="true" /> Imprimir ou salvar em PDF
              </button>
            </div>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-14 max-w-[1200px] px-5 pb-20 md:px-8 print:mt-0 print:max-w-none print:px-0 print:pb-0">
          <article className="rounded-[1.75rem] bg-white p-6 shadow-[0_16px_38px_rgba(15,30,18,.12)] sm:p-10 print:rounded-none print:p-0 print:shadow-none">
            <LegalDocument key={slug} doc={doc} />
          </article>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
