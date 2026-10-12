"use client";
// Shown instead of a crash screen when a page fails to load (usually the database waking up).
// Next.js uses this file automatically for any page error. It must be a Client Component.

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { DatabaseZap, RotateCcw } from "lucide-react";
import { buttonPrimary, card } from "@/components/ui/styles";

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  function tryAgain() {
    // Fetch the page from the server again, then clear the error.
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className={`${card} w-full max-w-md text-center`}>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
          <DatabaseZap className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-bold">The system is a little busy</h1>
        <p className="mt-2 text-slate-600">
          We use a free database that goes to sleep when nobody is using it, and it can take a few seconds to wake
          up. Please be patient and try again.
        </p>
        <button onClick={tryAgain} className={`${buttonPrimary} mt-5 w-full`}>
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
      </div>
    </main>
  );
}
