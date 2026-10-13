"use client";
// A tiny form, so logging out works even without JavaScript.
// While logging out, the icon turns into a spinner and the button cannot be clicked twice.

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { Spinner } from "./ui/LogoLoader";

// useFormStatus only works inside the <form>, so the button is its own component.
function LogoutSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
    >
      {pending ? <Spinner /> : <LogOut className="h-4 w-4" aria-hidden />}
      <span className="sr-only sm:not-sr-only">{pending ? "Logging out..." : "Log out"}</span>
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <LogoutSubmit />
    </form>
  );
}
