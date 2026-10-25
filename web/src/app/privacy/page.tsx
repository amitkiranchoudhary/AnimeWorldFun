import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import PolicyToc from "@/components/info/PolicyToc";
import { ISSUES_URL, PROFILE_URL } from "@/components/info/links";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Anime World Fun handles your data: no visitor accounts, no analytics, no ads, one browser preference, and anime data fetched server-side from AniList.",
};

// Bump this whenever the policy text changes.
const LAST_UPDATED = "25 October 2026";

const TLDR = [
  { icon: "🙅", title: "No accounts", body: "Visitors never sign up or log in. There's nothing to register for." },
  { icon: "🚫", title: "No tracking or ads", body: "No analytics, no pixels, no ad cookies — not now. We'll update this first if that changes." },
  { icon: "🏮", title: "One preference", body: "If you switch the straw-hat cursor off, your browser remembers it. That's all." },
  { icon: "🗺️", title: "Data from AniList", body: "Our server fetches anime info from AniList. Your details are never sent to it." },
];

/** A name/value row in a storage card. */
function Row({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="grid gap-0.5 border-t border-white/5 py-2.5 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/40">{k}</dt>
      <dd className="text-sm text-text/90">{children}</dd>
    </div>
  );
}

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "who",
    title: "Who runs this site",
    body: (
      <>
        <p>
          Anime World Fun is a free, non-commercial fan site, built and run by one person (&ldquo;the owner&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). It isn&apos;t affiliated with AniList, any streaming service or any anime
          studio. This policy explains, in plain words, what happens to information when you visit — based on what the
          site&apos;s code actually does.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we collect (and don't)",
    body: (
      <>
        <ul>
          <li>
            <strong>No visitor accounts.</strong> There are no sign-ups, profiles, newsletters or comment boxes. The only
            login on the site is a private one for the owner.
          </li>
          <li>
            <strong>No forms that send us your details.</strong> The &ldquo;message in a bottle&rdquo; on the{" "}
            <Link href="/contact">contact page</Link> is written in your browser and only handed to GitHub if you choose
            to open it there. Our server never receives it.
          </li>
          <li>
            <strong>Searches and filters.</strong> When you search or filter on <Link href="/explore">Explore</Link>, your
            words and choices go into the page address and our server uses them to ask AniList for matching anime. We
            don&apos;t save them or connect them to you.
          </li>
          <li>
            <strong>Tracking is coming later.</strong> When the My List feature arrives, this policy will be updated
            before it launches to explain exactly what it stores and where.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "storage",
    title: "Cookies & browser storage",
    body: (
      <>
        <p>The whole list is two items. Nothing here is used for advertising or tracking.</p>
        <div className="not-prose mt-5 grid gap-4">
          <div className="glass rounded-2xl px-5 pb-2 pt-4">
            <p className="mb-2 font-mono text-sm font-bold text-straw">awf_owner</p>
            <dl>
            <Row k="Type">Cookie (strictly necessary)</Row>
            <Row k="Who gets it">Only the site owner, after signing in on the owner-only login page. Visitors never receive it.</Row>
            <Row k="What's inside">A signed expiry time — no name, email or ID.</Row>
            <Row k="Settings">HttpOnly (page scripts can&apos;t read it), Secure (HTTPS only) on the live site, SameSite=Lax.</Row>
            <Row k="Lasts">About a week (7 days), or until the owner signs out.</Row>
            </dl>
          </div>
          <div className="glass rounded-2xl px-5 pb-2 pt-4">
            <p className="mb-2 font-mono text-sm font-bold text-straw">awf-cursor-off</p>
            <dl>
            <Row k="Type">Local storage in your browser</Row>
            <Row k="When">Saved when you switch the straw-hat cursor off or back on from the navigation bar.</Row>
            <Row k="What's inside">&ldquo;1&rdquo; (cursor off) or &ldquo;0&rdquo; (cursor on).</Row>
            <Row k="Sent to us?">Never. It stays on your device.</Row>
            <Row k="Lasts">Until you clear this site&apos;s data in your browser.</Row>
            </dl>
          </div>
        </div>
        <p>
          The site itself sets no other cookies. A YouTube trailer, if you load one, may set its own — see the next
          section.
        </p>
      </>
    ),
  },
  {
    id: "services",
    title: "Other services your visit touches",
    body: (
      <>
        <ul>
          <li>
            <strong>AniList</strong> (<Out href="https://anilist.co">anilist.co</Out>) supplies titles, descriptions,
            scores and streaming links. Our server fetches this from AniList&apos;s public API and caches it for hours. Your
            browser doesn&apos;t contact the AniList API, and we send AniList nothing about you.
          </li>
          <li>
            <strong>Anime images</strong> come from AniList&apos;s image server, <code>s4.anilist.co</code>. Posters and
            banners are fetched and resized by our server and delivered from our own address. The small platform icons on
            an anime&apos;s &ldquo;Where to watch&rdquo; buttons load straight from <code>s4.anilist.co</code>, so that
            server sees an ordinary image request (your IP address and browser type, like any website would).
          </li>
          <li>
            <strong>YouTube trailers.</strong> Anime pages with a trailer embed YouTube&apos;s privacy-enhanced player (
            <code>youtube-nocookie.com</code>). Nothing from YouTube loads until you press play on a trailer. From then on, YouTube (Google) may receive your IP address and set its own cookies or storage under{" "}
            <Out href="https://policies.google.com/privacy">Google&apos;s privacy policy</Out>.
          </li>
          <li>
            <strong>Fonts.</strong> Bangers and Nunito are bundled with the site (via Next.js&apos;s font system) and
            served from our own address. Your browser never contacts Google Fonts.
          </li>
          <li>
            <strong>The cherry blossom photo</strong> — &ldquo;Sakura branch&rdquo; by Raita Futo, from{" "}
            <Out href="https://commons.wikimedia.org/wiki/File:Sakura_branch_(52013006346).jpg">Wikimedia Commons</Out> (CC
            BY 2.0) — is stored on and served from our own server, so no request goes to Wikimedia.
          </li>
          <li>
            <strong>Links out.</strong> Streaming platforms, AniList and GitHub have their own privacy policies, which apply
            once you follow a link to them.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "hosting",
    title: "Hosting & server logs",
    body: (
      <p>
        Like every website, the server that delivers Anime World Fun receives standard technical details with each request
        — your IP address, browser type, the page asked for and the time — because that&apos;s how web pages are sent. The
        server or hosting provider may keep these in short-lived logs for security and troubleshooting. We don&apos;t use
        them to profile or identify visitors, and we never sell or share them.
      </p>
    ),
  },
  {
    id: "ads",
    title: "Analytics, tracking & ads",
    body: (
      <>
        <p>
          Right now there are <strong>no analytics, no tracking pixels, no advertising and no ad cookies</strong> on Anime
          World Fun.
        </p>
        <p>
          If that ever changes — for example, adding Google AdSense to help cover hosting — this policy will be updated{" "}
          <strong>before</strong> anything is switched on. The update will say what is collected, which cookies are used
          (including any third-party cookies from Google and its partners for personalised ads), and how to opt out. Where
          the law requires it, you&apos;ll be asked for consent first.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Anime World Fun is a general-audience anime guide and isn&apos;t directed at children under 13. We don&apos;t
        knowingly collect personal information from anyone, children included. If you think a child has shared personal
        details with us — for example in a GitHub issue on this project — tell us and we&apos;ll remove it.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices & rights",
    body: (
      <>
        <p>
          Because we don&apos;t keep personal information about visitors, there&apos;s normally nothing for us to access,
          correct, export or delete. What lives in your browser is yours to control: clearing this site&apos;s data in your
          browser settings removes the cursor preference.
        </p>
        <p>
          Whatever privacy law applies to you (such as the GDPR, UK GDPR, California&apos;s CCPA or India&apos;s DPDP Act),
          you&apos;re welcome to contact us with any question or request, and we&apos;ll answer it. We do not sell or share
          personal information.
        </p>
        <p>
          Messages you post on GitHub are public and covered by{" "}
          <Out href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">
            GitHub&apos;s privacy statement
          </Out>
          . Ask us and we&apos;ll delete an issue you opened on this project.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <p>
        The live site is served over HTTPS. The owner&apos;s login cookie is signed so it can&apos;t be forged, and is hidden
        from page scripts. Every page is sent with security headers that stop other sites from framing it, block content-type
        sniffing, trim the referrer information passed to other sites, and switch off camera, microphone and location access.
        No system is perfect — but by design there&apos;s very little personal data here to protect.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        When this policy changes, the &ldquo;last updated&rdquo; date at the top changes with it, and anything that affects
        you (like adding ads or tracking) will be described here before it goes live. The site&apos;s code is on GitHub, so
        earlier versions of this page can be found in the project&apos;s history.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>
          There&apos;s no email address. For privacy questions or requests, open an issue on the{" "}
          <Out href={ISSUES_URL}>project&apos;s GitHub issues</Out> or reach the owner through{" "}
          <Out href={PROFILE_URL}>their GitHub profile</Out>. Issues are public, so please leave personal details out —
          or see the <Link href="/contact">contact page</Link> for a friendly way to write one.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  const toc = [{ id: "short", title: "The short version" }, ...SECTIONS.map(({ id, title }) => ({ id, title }))];

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60svh] bg-[radial-gradient(50%_60%_at_50%_20%,rgba(255,120,180,0.14),transparent_70%)]" />

      {/* ── Title card ─────────────────────────────────────── */}
      <header className="text-center">
        <Reveal y={10} blur={4}>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.4em] text-muted sm:text-xs">
            <span className="text-sash">●</span> Plain words, no legalese
          </p>
        </Reveal>
        <SplitText
          text="Privacy Policy"
          as="h1"
          by="char"
          stagger={35}
          className="mt-4 font-display text-[clamp(3rem,11vw,7.5rem)] uppercase leading-[0.9] tracking-wide text-text text-glow-pink"
        />
        <Reveal delay={400}>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.25em] text-white/45">Last updated · {LAST_UPDATED}</p>
        </Reveal>
      </header>

      {/* ── The short version ──────────────────────────────── */}
      <section id="short" aria-labelledby="short-title" className="mt-16 scroll-mt-28">
        <h2 id="short-title" className="sr-only">
          The short version
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TLDR.map((t, i) => (
            <Reveal as="li" key={t.title} delay={i * 90} scale={0.97} className="glass rounded-2xl p-5">
              <span aria-hidden className="text-2xl">
                {t.icon}
              </span>
              <h3 className="mt-3 font-display text-2xl tracking-wide text-straw">{t.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── The full policy ────────────────────────────────── */}
      <div className="mt-16 grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <PolicyToc items={toc} />
        </aside>

        <div className="policy min-w-0">
          {SECTIONS.map((s, i) => (
            <Reveal as="section" key={s.id} y={18} blur={4} className="policy-section scroll-mt-28">
              <div id={s.id} className="scroll-mt-28">
                <h2 id={`${s.id}-title`} className="flex items-baseline gap-4 font-display text-3xl tracking-wide text-text sm:text-4xl">
                  <span aria-hidden className="font-mono text-sm text-[#ff9fc8]">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                <div className="policy-body mt-4">{s.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style href="awf-policy" precedence="default">{`
        .policy-section { padding: 2.25rem 0; border-top: 1px solid rgba(255,255,255,0.07); }
        .policy-section:first-child { border-top: 0; padding-top: 0; }
        .policy-body { color: var(--text-muted); line-height: 1.8; max-width: 44rem; }
        .policy-body > p + p, .policy-body > * + p { margin-top: 1rem; }
        .policy-body strong { color: var(--text); }
        .policy-body ul:not(.not-prose) { display: grid; gap: 0.85rem; }
        .policy-body ul:not(.not-prose) > li { position: relative; padding-left: 1.6rem; }
        .policy-body ul:not(.not-prose) > li::before {
          content: "✿"; position: absolute; left: 0; top: 0; color: #ff9fc8;
          text-shadow: 0 0 10px rgba(255,150,200,0.6);
        }
        .policy-body a {
          color: var(--straw); font-weight: 700; text-decoration: underline; text-decoration-color: rgba(242,201,76,0.4);
          text-underline-offset: 3px; transition: text-decoration-color .3s var(--ease-out); border-radius: 4px;
        }
        .policy-body a:hover { text-decoration-color: var(--straw); }
        .policy-body a:focus-visible { outline: 2px solid var(--straw); outline-offset: 2px; }
        .policy-body code {
          font-size: 0.85em; padding: 0.1em 0.4em; border-radius: 6px;
          background: rgba(255,255,255,0.07); color: var(--foam); overflow-wrap: anywhere;
        }
      `}</style>
    </div>
  );
}
