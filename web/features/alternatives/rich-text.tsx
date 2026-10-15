import type { FeatureContext } from "../../feature-types.ts";

function format(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\n)/g).map((part, index) => {
    if (part === "\n") return <br key={index} />;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export function PostBody({ post }: FeatureContext) {
  return <p className="body">{format(post?.body ?? "")}</p>;
}
