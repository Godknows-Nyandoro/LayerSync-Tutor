import { db } from "./db";
import type { GuideSection } from "@/data/guides";

// The approved guide for a topic as plain text, used to ground the tutor and the marker.
// Returns null if the guide is not approved yet (drafts are never shown to students).
export async function getApprovedGuideText(topicKey: string) {
  const guide = await db.guide.findFirst({ where: { topicKey, status: "APPROVED" } });
  if (!guide) return null;
  const sections = guide.sections as GuideSection[];
  return sections.map((section) => `${section.heading}: ${section.body}`).join("\n\n");
}
