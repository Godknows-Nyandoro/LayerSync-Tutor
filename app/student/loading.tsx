// Shown under the header while a student page loads its data from the database.
import { LogoLoader } from "@/components/ui/LogoLoader";

export default function Loading() {
  return <LogoLoader label="Loading your topics..." />;
}
