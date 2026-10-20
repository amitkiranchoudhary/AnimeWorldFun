import Link from "next/link";
import StrawHat from "./StrawHat";

// Placeholder for pages that land in later phases
export default function ComingSoon({ title, phase, body }: { title: string; phase: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <StrawHat width={110} className="-rotate-12" />
      <p className="mt-6 font-display text-lg tracking-wider text-sash">{phase}</p>
      <h1 className="title-stroke mt-1 text-5xl sm:text-6xl">{title}</h1>
      <p className="mt-5 leading-relaxed text-muted">{body}</p>
      <Link href="/" className="mt-8 rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)]">
        ← Back to the harbour
      </Link>
    </div>
  );
}
