import { useState } from "react";
import type { FeatureContext } from "../feature-types.ts";

type Reply = { title: string; body: string };
export function Toolbar({ api }: FeatureContext) {
  const [replies, setReplies] = useState<Reply[] | null>(null);
  return <>
    <button onClick={async () => setReplies(await api("/api/notifications"))}>Replies to me</button>
    {replies && <section className="notice-list" aria-label="Replies to me">
      <button onClick={() => setReplies(null)}>Close</button>
      {replies.length ? replies.map((reply, index) => <p key={index}><strong>{reply.title}</strong>: {reply.body}</p>) : <p>No new replies.</p>}
    </section>}
  </>;
}
