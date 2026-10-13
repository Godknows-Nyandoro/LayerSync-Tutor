"use client";
// A form button that shows a spinner and a "working" label while its Server Action runs,
// and is disabled so it cannot be clicked twice.

import { useFormStatus } from "react-dom";
import { Spinner } from "./ui/LogoLoader";

export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}
