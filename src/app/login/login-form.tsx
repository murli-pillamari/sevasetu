"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          ઇમેઇલ (Email)
        </label>
        <input
          autoComplete="username"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          id="email"
          maxLength={254}
          name="email"
          placeholder="name@example.com"
          required
          type="email"
          aria-describedby={state?.emailError ? "email-error" : undefined}
          aria-invalid={Boolean(state?.emailError)}
        />
        {state?.emailError ? (
          <p id="email-error" className="mt-1 text-sm text-red-700">
            {state.emailError}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-800"
        >
          પાસવર્ડ (Password)
        </label>
        <input
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
          id="password"
          maxLength={72}
          name="password"
          required
          type="password"
          aria-describedby={state?.passwordError ? "password-error" : undefined}
          aria-invalid={Boolean(state?.passwordError)}
        />
        {state?.passwordError ? (
          <p id="password-error" className="mt-1 text-sm text-red-700">
            {state.passwordError}
          </p>
        ) : null}
      </div>

      {state?.error ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <button
        className="flex w-full items-center justify-center rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "પ્રવેશ કરી રહ્યા છીએ… (Signing in…)" : "પ્રવેશ કરો (Sign in)"}
      </button>
    </form>
  );
}
