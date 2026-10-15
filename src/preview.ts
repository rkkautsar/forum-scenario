export function preview(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  const points = Array.from(compact);
  return points.length > 180 ? points.slice(0, 180).join("") + "…" : compact;
}
