import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PostReader from "@/components/blog/PostReader";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { displayTitle, getAnime } from "@/lib/anilist";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { readMinutes, renderMarkdown } from "@/lib/markdown";

type Props = PageProps<"/blog/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Post not found" };
  const anime = post.anime ? await getAnime(post.anime) : null;
  return {
    title: post.title,
    description: post.summary || undefined,
    openGraph: {
      type: "article",
      publishedTime: post.date,
      images: anime ? [anime.bannerImage ?? anime.coverImage.extraLarge] : undefined,
    },
  };
}

async function PostContent({ params }: { params: Props["params"] }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const anime = post.anime ? await getAnime(post.anime) : null;
  const { nodes, words } = renderMarkdown(post.body);
  const more = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);
  const art = anime?.bannerImage ?? anime?.coverImage.extraLarge ?? null;

  return (
    <article className="relative overflow-x-clip pb-24">
      {/* the anime's art, fading into the sea */}
      <header className="relative px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
        {art && (
          <div aria-hidden className="absolute inset-0 -z-10">
            <Image src={art} alt="" fill sizes="100vw" priority className="object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/40 via-[#121212]/70 to-[#121212]" />
          </div>
        )}
        <div className="mx-auto max-w-3xl">
          <Reveal y={10}>
            <Link
              href="/blog"
              className="text-sm font-extrabold uppercase tracking-[0.25em] text-sash underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              ← Captain&apos;s Log
            </Link>
          </Reveal>
          <SplitText
            as="h1"
            text={post.title}
            stagger={45}
            delay={150}
            className="mt-4 font-display text-[clamp(2.6rem,8vw,4.75rem)] leading-[0.95] tracking-wide text-text text-glow-pink"
          />
          <Reveal delay={500} y={8}>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-bold text-muted">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              <span>{readMinutes(words.length)} min read</span>
              {post.audio && (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-straw">🎙️ Narrated by the captain</span>
                </>
              )}
            </p>
            {post.summary && <p className="mt-5 text-lg leading-relaxed text-text/90">{post.summary}</p>}
            {post.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t} className="rounded-full border border-straw/40 bg-black/30 px-3 py-1 text-xs font-bold text-straw">
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <PostReader words={words} audio={post.audio} timings={post.timings}>
          {nodes}
        </PostReader>

        {anime && (
          <Reveal className="mt-16">
            <Link
              href={`/anime/${anime.id}`}
              className="glass group flex items-center gap-5 rounded-3xl p-4 transition hover:border-straw/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
            >
              <span className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl" style={{ background: anime.coverImage.color ?? "#1d2c5e" }}>
                <Image src={anime.coverImage.large} alt="" fill sizes="80px" className="object-cover" />
              </span>
              <span>
                <span className="block text-xs font-extrabold uppercase tracking-[0.2em] text-sash">The anime in this post</span>
                <span className="mt-1 block font-display text-3xl tracking-wide text-straw">{displayTitle(anime)}</span>
                <span className="mt-1 block text-sm font-bold text-muted group-hover:text-text">Where to watch it, sub or dub →</span>
              </span>
            </Link>
          </Reveal>
        )}

        {more.length > 0 && (
          <section aria-label="More from the log" className="mt-16">
            <h2 className="font-display text-4xl tracking-wide text-text">More from the log</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {more.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="glass block h-full rounded-2xl p-4 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-straw"
                  >
                    <span className="block text-xs font-bold text-muted">{formatDate(p.date)}</span>
                    <span className="mt-1 block font-extrabold leading-snug text-text">{p.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}

function PostSkeleton() {
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-3xl px-4 pt-36 sm:px-6">
      <span className="sr-only">Loading post…</span>
      <div aria-hidden className="h-14 w-3/4 animate-pulse rounded-xl bg-white/10" />
      <div aria-hidden className="mt-6 h-4 w-1/3 animate-pulse rounded bg-white/10" />
      <div aria-hidden className="mt-12 space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-white/10" style={{ width: `${92 - i * 6}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function PostPage(props: Props) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <PostContent params={props.params} />
    </Suspense>
  );
}
