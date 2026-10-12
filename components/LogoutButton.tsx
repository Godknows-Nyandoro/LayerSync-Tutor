import { LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";

// A tiny form, so logging out works even without JavaScript.
export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span className="sr-only sm:not-sr-only">Log out</span>
      </button>
    </form>
  );
}
