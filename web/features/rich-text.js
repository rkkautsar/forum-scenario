export async function mount({ feed }) {
  for (const body of feed.querySelectorAll("[data-post-body]")) {
    const text = body.textContent;
    const formatted = text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
    body.innerHTML = formatted;
  }
}
