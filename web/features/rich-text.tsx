import type { FeatureContext } from "../feature-types.ts";

function format(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\n)/g).map((part, index) => {
    if (part === "\n") return <br key={index} />;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function PostBody({ post }: FeatureContext) {
  const html = (post?.body ?? "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  return <p className="body" dangerouslySetInnerHTML={{ __html: html }} />;
}
