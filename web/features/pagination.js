export async function mount({ posts, refresh, state, pagination }) {
  pagination.replaceChildren();

  const offset = Number(state.query.get("offset") ?? 0),
    size = 2;
  const previous = document.createElement("button");
  previous.textContent = "← Newer";
  previous.disabled = offset === 0;
  previous.onclick = () => {
    state.query.set("offset", Math.max(0, offset - size));
    refresh();
  };

  const next = document.createElement("button");
  next.textContent = "Older →";
  next.disabled = posts.length < size;
  next.onclick = () => {
    state.query.set("offset", offset + size);
    refresh();
  };
  pagination.append(previous, next);
}
