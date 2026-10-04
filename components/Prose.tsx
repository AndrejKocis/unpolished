import { MDXRemote } from "next-mdx-remote/rsc";
import { DidYouKnow } from "@/components/DidYouKnow";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locale";

export function Prose({ content, locale }: { content: string; locale: Locale }) {
  const label = dictionaries[locale].watchDetail.didYouKnow;
  return (
    <div className="text-15 leading-relaxed [&>p]:mb-4 [&>p:last-child]:mb-0">
      <MDXRemote
        source={content}
        components={{ DidYouKnow: (props: Parameters<typeof DidYouKnow>[0]) => <DidYouKnow {...props} label={label} /> }}
      />
    </div>
  );
}
