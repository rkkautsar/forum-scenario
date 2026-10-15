export async function mount({ feed }) {
  for (const body of feed.querySelectorAll("[data-post-body]")) {
    const text = body.textContent;
    body.replaceChildren();
    for (const [i, line] of text.split("\n").entries()) {
      if (i) body.append(document.createElement("br"));

      let previous = 0;
      const pattern = /\*\*(.+?)\*\*/g;
      for (const match of line.matchAll(pattern)) {
        body.append(document.createTextNode(line.slice(previous, match.index)));

        const strong = document.createElement("strong");
        strong.textContent = match[1];
        body.append(strong);
        previous = match.index + match[0].length;
      }

      body.append(document.createTextNode(line.slice(previous)));
    }
  }
}
