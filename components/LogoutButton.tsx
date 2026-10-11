import { logout } from "@/app/login/actions";

// A tiny form, so logging out works even without JavaScript.
export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-gray-600 underline">
        Log out
      </button>
    </form>
  );
}
