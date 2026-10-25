import type { Metadata } from "next";
import Image from "next/image";
import compass from "../../../public/images/compass.png";
import NightHarbour from "@/components/account/NightHarbour";
import CardLight from "@/components/account/CardLight";
import s from "@/components/account/night.module.css";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Captain's Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
      <NightHarbour />

      <div className="relative w-full max-w-md">
        {/* warm light pooling behind the card */}
        <div aria-hidden className={`${s.cardGlow} pointer-events-none absolute -inset-16 -z-10 rounded-full`} />

        {/* paper lantern hanging over the card */}
        <div aria-hidden className={`${s.lanternSwing} absolute -top-16 left-1/2 z-10 -ml-5 flex w-10 flex-col items-center`}>
          <span className="h-8 w-px bg-straw/60" />
          <span className="h-1.5 w-6 rounded-sm bg-ink" />
          <span className={`${s.lantern} h-11 w-10 rounded-[45%]`} />
          <span className="h-1.5 w-6 rounded-sm bg-ink" />
          <span className="h-3 w-px bg-sash/80" />
        </div>

        <section
          aria-labelledby="login-title"
          className={`glass ${s.cardIn} relative overflow-hidden rounded-[2rem] px-5 pb-8 pt-16 text-center sm:px-9`}
        >
          {/* lantern light falling on the top edge of the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(255,180,80,0.28), transparent)" }}
          />

          {/* and a softer pool that follows the mouse */}
          <CardLight />

          <Image
            src={compass}
            alt=""
            className="relative mx-auto h-auto w-20 drop-shadow-[0_0_18px_rgba(242,201,76,0.35)]"
            style={{ animation: "compass-wobble 3s ease-in-out infinite" }}
            priority
          />
          <p className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-sash/50 bg-sash/15 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.25em] text-[#ffc9cd]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sash" style={{ boxShadow: "0 0 8px var(--sash)" }} />
            Owner only
          </p>
          <h1 id="login-title" className="title-stroke relative mt-3 text-5xl sm:text-6xl">
            Captain&apos;s Login
          </h1>
          <p className="relative mt-3 text-sm leading-relaxed text-muted">
            This is where the site owner writes blogs and manages the site.
          </p>

          <LoginForm />
        </section>

        <p aria-hidden className="mt-6 text-center font-display text-sm tracking-[0.35em] text-white/30">
          夜の港 · THE NIGHT HARBOUR
        </p>
      </div>
    </div>
  );
}
