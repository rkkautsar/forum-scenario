const $ = (id) => document.getElementById(id);

export const state = { query: new URLSearchParams() };

export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-demo-user": $("user").value || "maya",
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) throw Error(data.error);

  return data;
}

const mounts = [];

export async function refresh() {
  try {
    const posts = await api("/api/posts?" + state.query);
    $("feed").replaceChildren();

    if (!posts.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "No threads found.";
      $("feed").append(empty);
    }

    for (const post of posts) {
      const article = document.createElement("article");
      article.className = "thread";
      article.dataset.postId = post.id;

      const meta = document.createElement("div");
      meta.className = "meta";

      const avatar = document.createElement("span");
      avatar.className = "avatar";
      avatar.textContent = post.author[0];
      meta.append(
        avatar,
        document.createTextNode(post.author + " · community member"),
      );

      const title = document.createElement("h2");
      title.textContent = post.title;

      const body = document.createElement("p");
      body.className = "body";
      body.dataset.postBody = "";
      body.textContent = post.preview;

      const actions = document.createElement("div");
      actions.className = "actions";
      actions.dataset.actions = "";

      const toggle = document.createElement("button");
      toggle.textContent = post.comments.length + " comments";
      actions.append(toggle);

      const comments = document.createElement("div");
      comments.className = "comments";
      comments.hidden = true;
      toggle.onclick = () => (comments.hidden = !comments.hidden);
      for (const comment of post.comments) {
        const row = document.createElement("div");
        row.className = "comment";
        row.dataset.commentId = comment.id;
        row.dataset.authorId = comment.authorId;

        const author = document.createElement("strong");
        author.textContent =
          comment.author + (comment.editedAt ? " · edited" : "");

        const text = document.createElement("p");
        text.textContent = comment.body;
        row.append(author, text);
        comments.append(row);
      }

      const reply = document.createElement("form");
      reply.className = "reply";

      const input = document.createElement("input");
      input.placeholder = "Add something to the conversation";
      input.required = true;
      input.maxLength = 2000;

      const send = document.createElement("button");
      send.textContent = "Reply";
      reply.append(input, send);
      reply.onsubmit = (e) => {
        e.preventDefault();
        action(() =>
          api("/api/posts/" + post.id + "/comments", {
            method: "POST",
            body: JSON.stringify({ body: input.value }),
          }),
        );
      };
      comments.append(reply);
      article.append(meta, title, body, actions, comments);
      $("feed").append(article);
    }

    for (const mount of mounts)
      await mount({
        posts,
        api,
        refresh,
        state,
        user: $("user").value,
        feed: $("feed"),
        tools: $("tools"),
        pagination: $("pagination"),
      });
  } catch (error) {
    $("status").textContent = error.message;
  }
}

async function action(fn) {
  try {
    $("status").textContent = "";
    await fn();
    await refresh();
  } catch (error) {
    $("status").textContent = error.message;
  }
}

$("compose").onclick = () => ($("new-post").hidden = !$("new-post").hidden);

$("new-post").onsubmit = (e) => {
  e.preventDefault();
  action(async () => {
    const form = new FormData(e.target);
    await api("/api/posts", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(form)),
    });
    e.target.reset();
    e.target.hidden = true;
  });
};

$("user").onchange = () => refresh();

for (const user of await api("/api/users")) {
  const option = document.createElement("option");
  option.value = user.id;
  option.textContent = user.name;
  $("user").append(option);
}

for (const feature of await api("/api/features")) {
  const module = await import("/features/" + feature.id + ".js");
  mounts.push(module.mount);
}

await refresh();
