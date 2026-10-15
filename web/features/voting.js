export async function mount({ posts, api, refresh, feed }) {
  for (const post of posts) {
    const actions = feed.querySelector(
      `[data-post-id="${post.id}"] [data-actions]`,
    );
    const vote = document.createElement("button");
    vote.textContent = "↑ " + post.score;
    vote.onclick = async () => {
      await api("/api/posts/" + post.id + "/votes", { method: "POST" });
      await refresh();
    };
    actions.prepend(vote);
  }
}
