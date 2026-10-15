export async function mount({ feed, state }) {
  const empty = feed.querySelector(".empty");

  if (!empty) return;

  const title = document.createElement("strong");
  title.textContent = state.query.get("q")
    ? "No discussions match that search."
    : "Nothing here yet.";

  const hint = document.createElement("p");
  hint.textContent =
    state.query.get("saved") === "1"
      ? "Save a thread using the button below it, then find it here."
      : state.query.get("q")
        ? "Try a shorter phrase, or clear your search."
        : "Someone has to start the conversation. Ask a question or share what you are working on.";
  empty.replaceChildren(title, hint);
}
