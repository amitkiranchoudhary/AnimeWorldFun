"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={action} className="parchment mt-8 w-full rounded-2xl border-2 border-ink p-6 text-left shadow-[6px_6px_0_var(--ink)] sm:p-8">
      <label htmlFor="email" className="block text-sm font-extrabold">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        defaultValue={state.email}
        required
        className="mt-1 w-full rounded-xl border-2 border-ink bg-white/70 px-4 py-3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-sash"
      />

      <label htmlFor="password" className="mt-4 block text-sm font-extrabold">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className="mt-1 w-full rounded-xl border-2 border-ink bg-white/70 px-4 py-3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-sash"
      />

      {state.error && (
        <p role="alert" className="mt-4 rounded-lg bg-sash/15 px-3 py-2 text-sm font-bold text-sash">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-xl bg-sash py-3 font-display text-2xl tracking-wider text-white shadow-[3px_3px_0_var(--ink)] transition hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Boarding…" : "Board the ship"}
      </button>
    </form>
  );
}
