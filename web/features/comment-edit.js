export async function mount({ api, refresh, user, feed }) {
  for (const comment of feed.querySelectorAll("[data-comment-id]")) {
    if (comment.dataset.authorId !== user) continue;

    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.onclick = async () => {
      const body = prompt(
        "Update your comment",
        comment.querySelector("p").textContent,
      );

      if (body === null) return;

      await api("/api/comments/" + comment.dataset.commentId, {
        method: "PATCH",
        body: JSON.stringify({ body, authorId: user }),
      });
      await refresh();
    };
    comment.append(edit);
  }
}
