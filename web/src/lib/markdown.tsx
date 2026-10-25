import type { ReactNode } from "react";

// A small Markdown renderer for blog posts, shared by the post pages and the
// Studio preview. It builds React elements (never raw HTML), and wraps every
// word in <span data-w={i}> so the read-along can light it up; `words` is the
// same text in reading order, for the narrator and the voice timings.
//
// Supported: # / ## / ### headings, paragraphs, - or 1. lists, > quotes, ---,
// **bold**, *italic*, `code`, [links](https://…) and ||spoilers||.

export type Rendered = { nodes: ReactNode[]; words: string[] };

type Ctx = { words: string[]; key: number };

const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\|\|[^|]+\|\|)/g;

function wordsOf(text: string, ctx: Ctx): ReactNode[] {
  const out: ReactNode[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) out.push(" ");
    else {
      const i = ctx.words.push(part) - 1;
      out.push(
        <span key={ctx.key++} data-w={i}>
          {part}
        </span>,
      );
    }
  }
  return out;
}

// only web links and links within the site; anything else stays plain text
const safeHref = (href: string) => (/^https?:\/\//i.test(href) || /^\/(?!\/)/.test(href) ? href : null);

function inline(text: string, ctx: Ctx): ReactNode[] {
  const out: ReactNode[] = [];
  for (const tok of text.split(INLINE)) {
    if (!tok) continue;
    const k = ctx.key++;
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) out.push(<strong key={k}>{inline(tok.slice(2, -2), ctx)}</strong>);
    else if (tok.startsWith("||") && tok.endsWith("||") && tok.length > 4)
      out.push(
        // blurred until hovered, focused or tapped (CSS: .spoiler)
        <span key={k} className="spoiler" tabIndex={0} title="Spoiler — tap to reveal">
          {inline(tok.slice(2, -2), ctx)}
        </span>,
      );
    else if ((tok.startsWith("*") && tok.endsWith("*")) || (tok.startsWith("_") && tok.endsWith("_")))
      out.push(<em key={k}>{inline(tok.slice(1, -1), ctx)}</em>);
    else if (tok.startsWith("`") && tok.endsWith("`")) out.push(<code key={k}>{wordsOf(tok.slice(1, -1), ctx)}</code>);
    else if (tok.startsWith("[")) {
      const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      const href = m && safeHref(m[2]);
      if (m && href) {
        const external = /^https?:/i.test(href);
        out.push(
          <a key={k} href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {inline(m[1], ctx)}
          </a>,
        );
      } else out.push(...wordsOf(tok, ctx));
    } else out.push(...wordsOf(tok, ctx));
  }
  return out;
}

export function renderMarkdown(src: string): Rendered {
  const ctx: Ctx = { words: [], key: 0 };
  const nodes: ReactNode[] = [];
  const lines = src.replace(/\r\n?/g, "\n").split("\n");

  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];

  const flush = () => {
    if (para.length) nodes.push(<p key={ctx.key++}>{inline(para.join(" "), ctx)}</p>);
    para = [];
    if (list) {
      const items = list.items.map((it) => <li key={ctx.key++}>{inline(it, ctx)}</li>);
      nodes.push(list.ordered ? <ol key={ctx.key++}>{items}</ol> : <ul key={ctx.key++}>{items}</ul>);
    }
    list = null;
    if (quote.length) nodes.push(<blockquote key={ctx.key++}>{inline(quote.join(" "), ctx)}</blockquote>);
    quote = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      flush();
      const content = inline(m[2], ctx);
      // the page title is the only h1, so # and ## both become section headings
      nodes.push(m[1].length === 3 ? <h3 key={ctx.key++}>{content}</h3> : <h2 key={ctx.key++}>{content}</h2>);
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush();
      nodes.push(<hr key={ctx.key++} />);
    } else if ((m = /^>\s?(.*)$/.exec(line))) {
      if (para.length || list) flush();
      quote.push(m[1]);
    } else if ((m = /^(?:[-*]|(\d+)[.)])\s+(.*)$/.exec(line))) {
      const ordered = m[1] !== undefined;
      if (para.length || quote.length || (list && list.ordered !== ordered)) flush();
      list ??= { ordered, items: [] };
      list.items.push(m[2]);
    } else {
      if (list || quote.length) flush();
      para.push(line);
    }
  }
  flush();
  return { nodes, words: ctx.words };
}

/** Minutes to read at about 220 words a minute (at least 1). */
export const readMinutes = (words: number) => Math.max(1, Math.round(words / 220));
