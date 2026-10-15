export async function mount({ posts, api, refresh, user, feed, tools, state }) {
  for (const post of posts) {
    const button = document.createElement("button");
    button.textContent = post.saved ? "Saved ✓" : "Save";
    button.onclick = async () => {
      await api("/api/posts/" + post.id + "/bookmark", {
        method: post.saved ? "DELETE" : "POST",
      });
      refresh();
    };
    feed
      .querySelector(`[data-post-id="${post.id}"] [data-actions]`)
      .append(button);
  }

  let toggle = tools.querySelector("[data-saved]");

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.dataset.saved = "";
    tools.append(toggle);
  }

  toggle.textContent =
    state.query.get("saved") === "1" ? "Show all threads" : "My saved threads";
  toggle.onclick = () => {
    if (state.query.get("saved") === "1") state.query.delete("saved");
    else state.query.set("saved", "1");

    state.query.delete("offset");
    refresh();
  };
}
