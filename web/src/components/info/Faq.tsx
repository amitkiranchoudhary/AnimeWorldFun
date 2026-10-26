import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";

// Plain answers to the questions visitors actually ask, as native <details>
// (keyboard and screen-reader friendly, no JS), plus FAQPage data for Google.

const FAQS = [
  {
    q: "Is Anime World Fun free?",
    a: "Yes. Exploring anime, checking where to watch, keeping My List and reading the blog are all free, with no sign-up.",
  },
  {
    q: "Can I watch anime on this site?",
    a: "No. We don't host or stream any video. Each anime page links to the official platforms that carry it, like Crunchyroll or Netflix.",
  },
  {
    q: "How do I know if a show has a Hindi, Tamil or Telugu dub?",
    a: "Open the anime and look at “Where to watch”. Each platform shows the subtitle and dub languages we've checked. If it says “Not confirmed yet”, we haven't verified it, so check the platform before you start.",
  },
  {
    q: "Where is My List saved? Do I need an account?",
    a: "No account needed. My List is saved in your own browser on this device. To move it to another device, use “Download my list” and “Restore a backup”.",
  },
  {
    q: "Can I bring my list from AniList or MyAnimeList?",
    a: "Yes. On My List, type a public AniList username, or upload your MyAnimeList export file. Nothing changes on those sites.",
  },
  {
    q: "Some info is wrong. How do I report it?",
    a: "Send a message in a bottle from the Contact page. It opens a GitHub issue that the captain reads.",
    link: { href: "/contact", label: "Go to Contact →" },
  },
];

export default function Faq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section id="faq" aria-label="Frequently asked questions" className="relative mx-auto max-w-3xl scroll-mt-24 px-4 py-24 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Reveal>
        <p className="font-display text-lg tracking-[0.25em] text-sash">Questions from the crew</p>
      </Reveal>
      <SplitText as="h2" text="FAQ" className="mt-1 font-display text-6xl tracking-wide text-text text-glow-gold sm:text-7xl" />
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 60}>
            <details className="glass group rounded-2xl px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw">
                {f.q}
                <span aria-hidden className="text-straw transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted">
                {f.a}{" "}
                {f.link && (
                  <Link href={f.link.href} className="font-bold text-straw underline underline-offset-4">
                    {f.link.label}
                  </Link>
                )}
              </p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
