// Shared Tailwind class names, so buttons, cards and inputs look the same everywhere.

export const card = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const buttonPrimary = `${buttonBase} bg-orange-700 text-white hover:bg-orange-800`;
export const buttonSecondary = `${buttonBase} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
export const buttonSuccess = `${buttonBase} bg-green-600 text-white hover:bg-green-700`;
export const buttonDanger = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;

// text-base (16px) stops iPhones zooming in when an input is tapped.
export const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export const pageContainer = "mx-auto w-full max-w-3xl px-4 py-6 sm:py-8";
export const wideContainer = "mx-auto w-full max-w-6xl px-4 py-6 sm:py-8";
