"use client";
// Put this inside a <Link>. While that link's page is loading, it shows a spinner
// instead of its children (usually the link's icon), so the user sees their click worked.
// useLinkStatus is a Next.js hook that reports whether the surrounding <Link> is still loading.

import { useLinkStatus } from "next/link";
import { Spinner } from "./LogoLoader";

export function LinkPending({ children = null, className = "h-4 w-4" }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useLinkStatus();
  return pending ? <Spinner className={className} /> : children;
}
