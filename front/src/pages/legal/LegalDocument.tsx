import { ChevronDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LegalBlock, LegalDocumentData, LegalHighlight, LegalSection, LegalSlug } from "./content";

type OpenDocument = (slug: LegalSlug) => void;


const DOC_PATHS: Record<string, LegalSlug> = {
  "/termos-de-uso": "termos-de-uso",
  "/politica-de-privacidade": "politica-de-privacidade",
};

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/;
const LINK_TOKEN = /^\[([^\]]+)\]\(([^)]+)\)$/;

const LINK_CLASS =
  "font-bold text-[#2f681f] underline decoration-[#2f681f]/30 underline-offset-2 transition hover:decoration-[#2f681f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]";

function Inline({ text, onOpenDocument }: { text: string; onOpenDocument?: OpenDocument }) {
  return (
    <>
      {text.split(INLINE_TOKEN).map((part, index) => {
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-extrabold text-[#0f1f12]">
              {part.slice(2, -2)}
            </strong>
          );
        }

        const link = LINK_TOKEN.exec(part);
        if (!link) return part;

        const [, label, href] = link;
        const slug = DOC_PATHS[href];

        // Dentro da janela do cadastro, o link entre documentos troca o conteúdo da janela.
        if (slug && onOpenDocument) {
          return (
            <button key={index} type="button" onClick={() => onOpenDocument(slug)} className={LINK_CLASS}>
              {label}
            </button>
          );
        }
        if (slug) {
          return (
            <Link key={index} to={href} className={LINK_CLASS}>
              {label}
            </Link>
          );
        }
        return (
          <a key={index} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={LINK_CLASS}>
            {label}
          </a>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Blocos
// ─────────────────────────────────────────────────────────────────────────────

interface PreparedBlock {
  block: LegalBlock;
  label?: string;
  indent: boolean;
}

function prepareBlocks(section: LegalSection, sectionNumber: number): PreparedBlock[] {
  let clause = 0;
  let afterClause = false;

  return section.blocks.map((block) => {
    if (block.type === "clause") {
      clause += 1;
      afterClause = true;
      return { block, label: `${sectionNumber}.${clause}`, indent: false };
    }
    const indent = afterClause && block.type === "list";
    if (block.type !== "list") afterClause = false;
    return { block, indent };
  });
}

const BODY_TEXT = "text-[15px] leading-7 text-[#3a4d3d]";

function BlockView({ item, onOpenDocument }: { item: PreparedBlock; onOpenDocument?: OpenDocument }) {
  const { block } = item;

  switch (block.type) {
    case "clause":
      return (
        <div className={`flex gap-1 ${BODY_TEXT}`}>
          <span className="w-11 shrink-0 font-extrabold tabular-nums text-[#2f681f]">{item.label}</span>
          <p className="min-w-0 flex-1">
            <Inline text={block.text} onOpenDocument={onOpenDocument} />
          </p>
        </div>
      );

    case "p":
      return (
        <p className={BODY_TEXT}>
          <Inline text={block.text} onOpenDocument={onOpenDocument} />
        </p>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          className={[
            "flex flex-col gap-2 pl-5 marker:font-bold marker:text-[#2f681f]",
            BODY_TEXT,
            block.ordered ? "list-decimal" : "list-disc",
            item.indent ? "-mt-2 ml-11" : "",
          ].join(" ")}
        >
          {block.items.map((entry, index) => (
            <li key={index} className="pl-1">
              <Inline text={entry} onOpenDocument={onOpenDocument} />
            </li>
          ))}
        </Tag>
      );
    }

    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-[#e2e8e0] print:overflow-visible">
          <table className="w-full min-w-[32rem] border-collapse text-left text-[13px] leading-6 print:min-w-0">
            <thead className="bg-[#f0f9e8] text-[#163b1a]">
              <tr>
                {block.head.map((heading) => (
                  <th key={heading} scope="col" className="px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[.08em]">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8eee6] text-[#3a4d3d]">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="align-top even:bg-[#fafdf8] print:break-inside-avoid">
                  {row.map((cell, cellIndex) =>
                    cellIndex === 0 ? (
                      <th key={cellIndex} scope="row" className="px-4 py-3 text-left font-extrabold text-[#0f1f12]">
                        <Inline text={cell} onOpenDocument={onOpenDocument} />
                      </th>
                    ) : (
                      <td key={cellIndex} className="px-4 py-3">
                        <Inline text={cell} onOpenDocument={onOpenDocument} />
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "note":
      return (
        <div role="note" className="flex gap-3 rounded-2xl border border-[#d5e6c7] bg-[#f4f9ee] p-4 print:break-inside-avoid">
          <Info size={18} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 shrink-0 text-[#2f681f]" />
          <div className="text-[13.5px] leading-6 text-[#3a4d3d]">
            <strong className="block font-extrabold text-[#163b1a]">{block.title}</strong>
            <Inline text={block.text} onOpenDocument={onOpenDocument} />
          </div>
        </div>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Resumo e índice
// ─────────────────────────────────────────────────────────────────────────────

function Highlights({ items }: { items: LegalHighlight[] }) {
  return (
    <section aria-label="Resumo do documento" className="mt-8">
      <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7a8c7e]">Em resumo</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div key={item.title} className="flex gap-3 rounded-2xl border border-[#e2e8e0] bg-white p-4 print:break-inside-avoid">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#2f681f] text-xs font-extrabold text-[#c1f23c]"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="font-['Bricolage_Grotesque'] text-[15px] font-extrabold leading-tight text-[#163b1a]">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-[#5e7263]">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[#8a9d8e]">
        Este resumo é apenas informativo e não substitui o texto completo do documento.
      </p>
    </section>
  );
}

const anchorId = (doc: LegalDocumentData, section: LegalSection) => `${doc.slug}-${section.id}`;

function SideToc({ doc, activeId, onJump }: { doc: LegalDocumentData; activeId: string; onJump: (id: string) => void }) {
  return (
    <nav aria-label="Índice do documento" className="text-[13px]">
      <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7a8c7e]">Neste documento</p>
      <ol className="mt-3 border-l border-[#e2e8e0]">
        {doc.sections.map((section, index) => {
          const id = anchorId(doc, section);
          const active = id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${id}`}
                aria-current={active ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  onJump(id);
                }}
                className={[
                  "-ml-px flex gap-2 border-l-2 py-1.5 pl-3 pr-2 leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]",
                  active
                    ? "border-[#2f681f] font-extrabold text-[#163b1a]"
                    : "border-transparent font-semibold text-[#6d8071] hover:text-[#163b1a]",
                ].join(" ")}
              >
                <span className="tabular-nums text-[#9dab9f]">{index + 1}.</span>
                <span>{section.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TocDetails({ doc, onJump, className }: { doc: LegalDocumentData; onJump: (id: string) => void; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={`group rounded-2xl border border-[#e2e8e0] bg-[#fafdf8] print:hidden ${className ?? ""}`}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold text-[#163b1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f] [&::-webkit-details-marker]:hidden">
        Índice do documento
        <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open:rotate-180" />
      </summary>
      <ol className="grid gap-x-6 border-t border-[#e8eee6] px-4 py-3 sm:grid-cols-2">
        {doc.sections.map((section, index) => (
          <li key={section.id}>
            <button
              type="button"
              onClick={() => {
                onJump(anchorId(doc, section));
                setOpen(false);
              }}
              className="flex w-full gap-2 py-1.5 text-left text-[13px] font-semibold leading-5 text-[#4a5d4e] hover:text-[#163b1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]"
            >
              <span className="tabular-nums text-[#9dab9f]">{index + 1}.</span>
              <span>{section.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </details>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Documento
// ─────────────────────────────────────────────────────────────────────────────

export interface LegalDocumentProps {
  doc: LegalDocumentData;
  variant?: "page" | "modal";
  onOpenDocument?: OpenDocument;
}

export default function LegalDocument({ doc, variant = "page", onOpenDocument }: LegalDocumentProps) {
  const isPage = variant === "page";
  const [activeId, setActiveId] = useState(() => (doc.sections[0] ? anchorId(doc, doc.sections[0]) : ""));


  useEffect(() => {
    if (!isPage) return;

    const targets = doc.sections
      .map((section) => document.getElementById(anchorId(doc, section)))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (current) setActiveId(current.target.id);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [doc, isPage]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={isPage ? "lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12" : ""}>
      {isPage && (
        <aside className="hidden lg:block print:hidden">
          <div className="sticky top-24 max-h-[calc(100dvh_-_8rem)] overflow-y-auto pr-2">
            <SideToc doc={doc} activeId={activeId} onJump={jumpTo} />
          </div>
        </aside>
      )}

      <div className="min-w-0">
        <p className={BODY_TEXT}>
          <Inline text={doc.intro} onOpenDocument={onOpenDocument} />
        </p>

        <Highlights items={doc.highlights} />

        <TocDetails doc={doc} onJump={jumpTo} className={isPage ? "mt-6 lg:hidden" : "mt-6"} />

        <div className="mt-10 flex flex-col gap-9">
          {doc.sections.map((section, sectionIndex) => {
            const id = anchorId(doc, section);
            return (
              <section
                key={section.id}
                id={id}
                aria-labelledby={`${id}-titulo`}
                className={[
                  "border-t border-[#e8eee6] pt-9 first:border-t-0 first:pt-0",
                  isPage ? "scroll-mt-24" : "scroll-mt-2",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-7 min-w-7 shrink-0 place-items-center rounded-lg bg-[#2f681f] px-1.5 text-xs font-extrabold text-[#c1f23c]"
                  >
                    {sectionIndex + 1}
                  </span>
                  <h2
                    id={`${id}-titulo`}
                    className="font-['Bricolage_Grotesque'] text-[1.3rem] font-extrabold leading-snug text-[#0f1f12]"
                  >
                    {section.title}
                  </h2>
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  {prepareBlocks(section, sectionIndex + 1).map((item, blockIndex) => (
                    <BlockView key={blockIndex} item={item} onOpenDocument={onOpenDocument} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
