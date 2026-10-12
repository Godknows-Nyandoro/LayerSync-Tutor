"use client";
// A Client Component: it runs in the browser so it can show the error, "Signing in..."
// and fill the form when a demo account is tapped.

import { useActionState, useState } from "react";
import { GraduationCap, Info, KeyRound, Mail } from "lucide-react";
import { login } from "./actions";
import { buttonPrimary, card, input } from "@/components/ui/styles";

// Seeded test accounts (all fictitious), shown so reviewers can log in quickly.
const DEMO_PASSWORD = "Sync2026!";
const DEMO_ACCOUNTS = [
  { label: "Teacher: Mrs Rudo Moyo", email: "rudo.moyo@syncacademy.test" },
  { label: "Student: Tatenda Chikore (strong)", email: "tatenda.chikore@syncacademy.test" },
  { label: "Student: Kudzai Ndlovu (struggling)", email: "kudzai.ndlovu@syncacademy.test" },
  { label: "Student: Takudzwa Nyathi (new)", email: "takudzwa.nyathi@syncacademy.test" },
];

export default function LoginPage() {
  // error = what login() last returned; pending = true while the server is working
  const [error, formAction, pending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white">
            <GraduationCap className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-3 text-2xl font-bold">Sync Tutor</h1>
          <p className="text-sm text-slate-600">IGCSE Computer Science, Sync Academy</p>
        </div>

        <form action={formAction} className={`${card} space-y-4`}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${input} pl-9`}
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <div className="relative mt-1">
              <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${input} pl-9`}
              />
            </div>
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <details className={`${card} text-sm`}>
          <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-700">
            <Info className="h-4 w-4 text-orange-600" aria-hidden />
            Demo accounts
          </summary>
          <p className="mt-2 text-slate-500">
            All use the password <span className="font-mono text-slate-700">{DEMO_PASSWORD}</span>. Tap one to fill
            the form.
          </p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(DEMO_PASSWORD);
                  }}
                  className="w-full rounded-lg px-2 py-2 text-left hover:bg-slate-50"
                >
                  <span className="block font-medium text-slate-800">{account.label}</span>
                  <span className="block text-xs text-slate-500">{account.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </main>
  );
}
