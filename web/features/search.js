export async function mount({ refresh, state, tools }) {
  if (tools.querySelector("[data-search]")) return;
  const form = document.createElement("form");
  form.dataset.search = "";
  const input = document.createElement("input");
  input.placeholder = "Search discussions";
  input.setAttribute("aria-label", "Search discussions");
  input.value = state.query.get("q") ?? "";
  const button = document.createElement("button");
  button.textContent = "Search";
  form.append(input, button);
  form.onsubmit = (e) => {
    e.preventDefault();
    state.query.set("q", input.value);
    state.query.delete("offset");
    refresh();
  };
  tools.prepend(form);
}
