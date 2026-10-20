import Image from "next/image";
import Link from "next/link";
import compass from "../../public/images/compass.png";

// Placeholder for pages that land in later phases
export default function ComingSoon({ title, phase, body }: { title: string; phase: string; body: string }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Image
        src={compass}
        alt=""
        className="h-auto w-32 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
        style={{ animation: "compass-wobble 3s ease-in-out infinite" }}
      />
      <p className="mt-6 font-display text-lg tracking-wider text-sash">{phase}</p>
      <h1 className="title-stroke mt-1 text-5xl sm:text-6xl">{title}</h1>
      <p className="mt-5 leading-relaxed text-muted">{body}</p>
      <Link href="/" className="mt-8 rounded-full bg-straw px-6 py-3 font-extrabold text-ink shadow-[4px_4px_0_var(--ink)]">
        ← Back to the harbour
      </Link>
    </div>
  );
}
