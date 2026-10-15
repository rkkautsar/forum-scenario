export function preview(text: string): string {
  const chars = Array.from(text.replace(/\s+/g, " ").trim());
  return chars.length > 180
    ? chars.slice(0, 180).join("") + "…"
    : chars.join("");
}
