import { buildPrivacyPolicy } from "./privacyPolicy";
import { buildTermsOfUse } from "./termsOfUse";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
//
// Os documentos são descritos como dados e desenhados por <LegalDocument />.
// Nos textos, são aceitos dois recursos de formatação:
//   **negrito**               → destaque
//   [rótulo](/caminho-ou-url) → link (a rota de um dos documentos, mailto: ou https:)
// ─────────────────────────────────────────────────────────────────────────────

export type LegalSlug = "termos-de-uso" | "politica-de-privacidade";

export type LegalBlock =
  | { type: "clause"; text: string }
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; title: string; text: string };

export interface LegalSection {
  /** Identificador estável da seção (usado nos links de âncora). */
  id: string;
  title: string;
  blocks: LegalBlock[];
}

export interface LegalHighlight {
  title: string;
  text: string;
}

export interface LegalDocumentData {
  slug: LegalSlug;
  title: string;
  subtitle: string;
  intro: string;
  highlights: LegalHighlight[];
  sections: LegalSection[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Dados institucionais (um único lugar para atualizar os dois documentos)
//
// Ao publicar uma nova versão: altere `version` e as datas aqui e acrescente
// uma linha na seção "Histórico de versões" de cada documento.
// ─────────────────────────────────────────────────────────────────────────────

export const LEGAL_INFO = {
  platform: "Solum",
  version: "1.0",
  effectiveDate: "13 de novembro de 2026",
  updatedAt: "13 de novembro de 2026",
  contactEmail: "contato@solum.com.br",
  institution: "Centro Universitário de Patos de Minas (UNIPAM)",
  city: "Patos de Minas",
  forum: "comarca de Patos de Minas, Estado de Minas Gerais",
} as const;

export type LegalInfo = typeof LEGAL_INFO;

// ─────────────────────────────────────────────────────────────────────────────
// Registro 
export const LEGAL_SLUGS: LegalSlug[] = ["termos-de-uso", "politica-de-privacidade"];

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocumentData> = {
  "termos-de-uso": buildTermsOfUse(LEGAL_INFO),
  "politica-de-privacidade": buildPrivacyPolicy(LEGAL_INFO),
};
