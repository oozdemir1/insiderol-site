import { normalizeSearchText, slugifyText } from "./normalizationUtils";
export function slugifyCompanyName(
  text: string
) {
  return slugifyText(text);
}

// Matches common Turkish legal-entity suffixes (with or without dots/
// spacing) so "Migros" can match "Migros Ticaret A.Ş." without needing
// a hand-curated alias for every legal-form variant. Deliberately
// conservative — only strips pure legal-form markers, not generic
// business words (e.g. "Holding", "İnşaat") that can denote a genuinely
// different entity.
const LEGAL_SUFFIX_PATTERN =
  /\s+(a\.\s?s\.?|anonim sirketi|ltd\.?\s?sti\.?|limited sirketi)\.?$/;

export function normalizeCompanySearchText(
  text: string
) {
  return normalizeSearchText(text).replace(
    LEGAL_SUFFIX_PATTERN,
    ""
  );
}