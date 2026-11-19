import { ArrowUpRight, Check, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { LEGAL_DOCUMENTS, LEGAL_INFO, LEGAL_SLUGS, type LegalSlug } from "./content";
import LegalDocument from "./LegalDocument";

export interface LegalModalProps {
  open: boolean;
  slug: LegalSlug;
  onSlugChange: (slug: LegalSlug) => void;
  onClose: () => void;
  // Chamado ao selecionar
  onAccept: () => void;
}

//Deixa o restante da página inacessível enquanto a janela está aberta
export default function LegalModal({ open, slug, onSlugChange, onClose, onAccept }: LegalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const doc = LEGAL_DOCUMENTS[slug];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [slug, open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="legal-modal-title"
      onClose={onClose}
      onClick={(event) => {
        // Clique fora da janela (no fundo escurecido) fecha
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[calc(100%_-_1.5rem)] max-w-4xl overflow-hidden rounded-[1.75rem] border-0 bg-white p-0 font-['Manrope'] text-[#0b150c] shadow-[0_30px_80px_rgba(11,21,12,.35)] backdrop:bg-[#0b150c]/60 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[#e8eee6] px-5 pb-4 pt-5 sm:px-8">
            <div>
              <h2 id="legal-modal-title" className="font-['Bricolage_Grotesque'] text-xl font-extrabold leading-tight">
                {doc.title}
              </h2>
              <p className="mt-1 text-[11px] text-[#8a9d8e]">
                Versão {LEGAL_INFO.version} · atualizada em {LEGAL_INFO.updatedAt}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-[#5e7263] transition-colors hover:bg-[#edf2ec] hover:text-[#163b1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]"
            >
              <X size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          <div className="border-b border-[#e8eee6] px-5 py-3 sm:px-8">
            <div role="group" aria-label="Documentos legais" className="flex rounded-2xl bg-[#f0f0ec] p-1">
              {LEGAL_SLUGS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={item === slug}
                  onClick={() => onSlugChange(item)}
                  className={[
                    "flex-1 cursor-pointer rounded-xl px-3 py-2 text-[13px] font-extrabold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]",
                    item === slug ? "bg-white text-[#0f1f12] shadow-sm" : "text-[#7a8c7e] hover:text-[#2a3c2c]",
                  ].join(" ")}
                >
                  {LEGAL_DOCUMENTS[item].title}
                </button>
              ))}
            </div>
          </div>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
            <LegalDocument key={slug} doc={doc} variant="modal" onOpenDocument={onSlugChange} />
          </div>

          <div className="border-t border-[#e8eee6] bg-[#fafdf8] px-5 py-4 sm:px-8">
            <p className="text-[11px] leading-4 text-[#7a8c7e]">
              Ao selecionar “Li e aceito”, você confirma a leitura e o aceite dos Termos de Uso e da Política de Privacidade da Solum.
            </p>
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2f681f] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f]"
              >
                Abrir em página inteira <ArrowUpRight size={14} strokeWidth={2.25} aria-hidden="true" />
              </a>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 cursor-pointer rounded-2xl border border-[#d5e0d3] bg-white px-5 py-3 text-sm font-extrabold text-[#2a3c2c] transition-colors hover:bg-[#f4f8f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f] sm:flex-none"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#c1f23c] px-5 py-3 text-sm font-extrabold text-[#0b150c] transition-colors hover:bg-[#d1fa62] active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f681f] sm:flex-none"
                >
                  <Check size={16} strokeWidth={2.5} aria-hidden="true" /> Li e aceito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
