export function toTitleCaseTR(
  text: string
) {
  return text
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toLocaleUpperCase("tr-TR") +
        word.slice(1).toLocaleLowerCase("tr-TR")
    )
    .join(" ");
}