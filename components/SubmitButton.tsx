"use client";
// A form button that shows a "working" label while its Server Action runs.

import { useFormStatus } from "react-dom";

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
      {pending ? pendingLabel : label}
    </button>
  );
}
