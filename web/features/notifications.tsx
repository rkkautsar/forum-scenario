import { useState } from "react";
import type { FeatureContext } from "../feature-types.ts";

type Reply = { title: string; body: string };
type ReplyState = { user: string; items: Reply[] };
export function Toolbar({ api, user }: FeatureContext) {
  const [replies, setReplies] = useState<ReplyState | null>(null);
  return <>
    <button onClick={async () => setReplies({ user, items: await api("/api/notifications") })}>Replies to me</button>
    {replies?.user === user && <section className="notice-list" aria-label="Replies to me">
      <button onClick={() => setReplies(null)}>Close</button>
      {replies.items.length ? replies.items.map((reply, index) => <p key={index}><strong>{reply.title}</strong>: {reply.body}</p>) : <p>No new replies.</p>}
    </section>}
  </>;
}
