"use client";

import { useEffect, useRef, useState } from "react";
import { prequalify } from "@/lib/prequalify";
import { Badge, buttonStyles, cx, Icon } from "./ui";

/**
 * Embeds the dealer's raw QualifyWizard snippet inside a sandboxed iframe,
 * instead of injecting it into this page's own document.
 *
 * `autoInstall` snippets like this one ship as a bare `<script src>` with no
 * companion container element — the signature of a widget that
 * `document.write()`s its own markup at its own position in the DOM the
 * instant it runs, the same way it already does on the dealer's own
 * WordPress site (manufacturedcountryhomes.com), where the tag sits
 * directly in the raw HTML the browser parses. `document.write()` only
 * works while *that* document's parser is still open — true for a script
 * tag the parser meets mid-parse, never true again once the page has
 * finished loading. A React app mounts everything after that point (a hard
 * reload included: Next.js still hydrates, it doesn't leave the browser's
 * original parser open), so injecting the script into this page's own
 * document — via `dangerouslySetInnerHTML`, or a hand-built `<script>` node
 * appended in an effect — always hits a closed parser, and the write is
 * silently dropped or throws. It never renders, on this page, no matter how
 * the script itself is loaded.
 *
 * An `srcDoc` iframe sidesteps that entirely: its content becomes a brand
 * new document with its own parser, so the script tag inside it is met
 * during *that* document's initial parse — exactly the condition
 * `document.write()` needs — on every mount, hard reload or client-side
 * navigation alike, because each mount is a fresh iframe and a fresh nested
 * document (which also means no stale widget state or duplicate script
 * execution can survive a navigation away and back). A `ResizeObserver` on
 * the iframe's own document then grows the iframe to match the widget's
 * real height instead of capping or cropping it.
 */
function EmbedWidget({ html, className }: { html: string; className?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | undefined;
    const attach = () => {
      const root = iframe.contentDocument?.documentElement;
      if (!root) return;
      observer?.disconnect();
      observer = new ResizeObserver(([entry]) => setHeight(Math.ceil(entry.contentRect.height)));
      observer.observe(root);
    };

    // A hard page load server-renders this iframe as part of the page's own
    // initial HTML, so the browser can finish navigating it to its `srcDoc`
    // content before React ever hydrates and gets a chance to attach a
    // `load` listener below — by then the event has already fired and won't
    // fire again for this document. Attaching immediately covers that case;
    // the listener covers the ordinary case where hydration wins the race.
    if (iframe.contentDocument?.readyState === "complete") attach();
    iframe.addEventListener("load", attach);
    return () => {
      iframe.removeEventListener("load", attach);
      observer?.disconnect();
      setHeight(0);
    };
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Prequalification form"
      srcDoc={`<!doctype html><html><head><style>html,body{margin:0;padding:0}</style></head><body>${html}</body></html>`}
      className={cx("block w-full border-0", className)}
      style={height > 0 ? { height } : undefined}
    />
  );
}

/**
 * The financing page's fast-path prequalification card: reassurance copy on
 * one side, the dealer's embedded credit-check widget on the other.
 *
 * The QualifyWizard form renders directly — no button gates it. `EmbedWidget`
 * loads the QualifyWizard script on mount, and the plugin builds its own form
 * in place, so this panel never doubles the widget's own header and copy with
 * a separate reveal step.
 *
 * Renders nothing if neither an embed nor a fallback link is configured in
 * `lib/prequalify.ts`.
 */
export function PrequalifyPanel({ className }: { className?: string }) {
  const hasEmbed = !!prequalify.embedSnippet;
  const hasLink = !!prequalify.externalApplicationLink;

  if (!hasEmbed && !hasLink) return null;

  return (
    <div className={cx("grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16", className)}>
      <div>
        {prequalify.showNoSSNBadge && (
          <Badge tone="moss" className="mb-5">
            <Icon.Shield className="size-3.5" />
            No SSN required
          </Badge>
        )}
        <div className="grid gap-4 text-[0.98rem] leading-relaxed text-muted">
          {prequalify.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* No `overflow-hidden` here: QualifyWizard's own markup lands inside
          at a height this page doesn't control, and clipping it would cut
          off fields rather than just squaring the corners. */}
      <div className="w-full max-w-full overflow-x-hidden rounded-card border border-line bg-paper">
        {hasEmbed ? (
          <EmbedWidget html={prequalify.embedSnippet!} className="min-h-[34rem] w-full p-1" />
        ) : (
          <div className="flex flex-col items-center gap-5 p-8 text-center sm:p-10">
            <span className="grid size-14 place-items-center rounded-full bg-surface-2 text-ember">
              <Icon.Shield className="size-6" />
            </span>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Fill it in at home and bring it by the sales center, or call us first with any questions.
            </p>
            <a
              href={prequalify.externalApplicationLink}
              target="_blank"
              rel="noopener"
              className={cx(buttonStyles.primary, "!px-7 !py-4 !text-base")}
            >
              {prequalify.buttonText}
              <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
