// Next.js shows this straight away while any page outside /student and /teacher loads
// (e.g. the syllabus), so the user knows their click worked.
import { LogoLoader } from "@/components/ui/LogoLoader";

export default function Loading() {
  return <LogoLoader label="Loading..." />;
}
