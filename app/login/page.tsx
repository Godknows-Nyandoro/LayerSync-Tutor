"use client";
// A Client Component: it runs in the browser so it can show the error and "Signing in...".

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  // error = what login() last returned; pending = true while the server is working
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-bold">Sync Academy Tutor</h1>
      <p className="mt-1 text-gray-600">Sign in to continue</p>

      <form action={formAction} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border bg-white p-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border bg-white p-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-700 p-2 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
