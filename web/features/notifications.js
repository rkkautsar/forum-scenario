export async function mount({ api, tools }) {
  if (tools.querySelector("[data-notifications]")) return;

  const button = document.createElement("button");
  button.dataset.notifications = "";
  button.textContent = "Replies to me";
  button.onclick = async () => {
    const replies = await api("/api/notifications");
    alert(
      replies.length
        ? replies.map((r) => r.title + ": " + r.body).join("\n")
        : "No new replies.",
    );
  };
  tools.append(button);
}
