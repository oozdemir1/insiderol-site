export function normalizeRoleName(text: string) {
  return text
    .trim()
    .replace(/İ/g, "i") // Handle capital dotted İ before converting case
    .replace(/I/g, "ı") // Handle capital dotless I before converting case
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}