import type { FeatureContext } from "../feature-types.ts";

export function PostBody({ post }: FeatureContext) {
  return <p className="body">{post?.preview}</p>;
}
