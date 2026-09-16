import { MDXRemote } from "next-mdx-remote/rsc";

export function Prose({ content }: { content: string }) {
  return (
    <div className="text-15 leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0">
      <MDXRemote source={content} />
    </div>
  );
}
