"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/inView";
import s from "@/components/account/night.module.css";
import { login, type LoginState } from "./actions";

// a labelled input whose wrapper glows like lamplight while focused
function Field({
  id,
  label,
  icon,
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-extrabold uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      <div className={`${s.field} mt-2 flex items-center`}>
        <span aria-hidden className={`${s.fieldIcon} pointer-events-none absolute left-4 text-white/45`}>
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

const inputClass = `${s.input} w-full rounded-[0.9rem] py-3.5 pl-11 pr-4 font-bold text-text placeholder:text-white/30`;

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [reveal, setReveal] = useState(false);
  const alertRef = useRef<HTMLParagraphElement>(null);

  // a short shake each time a wrong answer comes back (even the same one twice)
  useEffect(() => {
    const el = alertRef.current;
    if (!el || !state.error || prefersReducedMotion() || typeof el.animate !== "function") return;
    const anim = el.animate(
      [
        { transform: "translate3d(0,0,0)" },
        { transform: "translate3d(-8px,0,0)" },
        { transform: "translate3d(7px,0,0)" },
        { transform: "translate3d(-4px,0,0)" },
        { transform: "translate3d(2px,0,0)" },
        { transform: "translate3d(0,0,0)" },
      ],
      { duration: 480, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => anim.cancel();
  }, [state]);

  return (
    <form action={action} aria-busy={pending} className="relative mt-8 space-y-5 text-left">
      <Field
        id="email"
        label="Email"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        }
      >
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          placeholder="captain@…"
          required
          className={inputClass}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        }
      >
        <input
          id="password"
          name="password"
          type={reveal ? "text" : "password"}
          autoComplete="current-password"
          required
          className={`${inputClass} pr-20`}
        />
        <button
          type="button"
          onClick={() => setReveal((r) => !r)}
          aria-pressed={reveal}
          aria-controls="password"
          className="absolute right-2 rounded-lg px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-muted transition hover:text-straw focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-straw"
        >
          {reveal ? "Hide" : "Show"}
        </button>
      </Field>

      {state.error && (
        <p
          ref={alertRef}
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-sash/50 bg-sash/15 px-3.5 py-3 text-sm font-bold text-[#ffc9cd]"
          style={{ boxShadow: "0 0 24px rgba(230,57,70,0.25)" }}
        >
          <span aria-hidden className="mt-px text-base leading-none text-sash">
            ⚓
          </span>
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        data-pending={pending ? "" : undefined}
        className={`${s.board} shimmer relative mt-2 block w-full overflow-hidden rounded-xl py-3.5 font-display text-2xl tracking-wider text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-straw disabled:opacity-90`}
      >
        <span className={`relative inline-block transition duration-300 ${pending ? "-translate-y-1.5" : ""}`}>
          {pending ? "Boarding…" : "Board the ship"}
        </span>
        {pending && (
          <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-2 h-5">
            {/* the rope sliding along, with a small ship riding it */}
            <span className="absolute inset-x-0 bottom-1 h-px overflow-hidden">
              <span className={`${s.rope} absolute -left-4 -right-4 inset-y-0`} />
            </span>
            <span className={`${s.sail} absolute inset-x-0 bottom-1 flex justify-center text-sm leading-none`}>⛵</span>
          </span>
        )}
      </button>
    </form>
  );
}
