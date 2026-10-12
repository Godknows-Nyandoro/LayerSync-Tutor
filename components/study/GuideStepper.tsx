"use client";
// The guide, one section at a time, with Back / Next buttons.
// Short screens are easier to focus on than one long page.

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle } from "lucide-react";
import type { GuideSection } from "@/data/guides";
import { GuideSectionCard } from "@/components/GuideView";
import { buttonPrimary, buttonSecondary } from "@/components/ui/styles";
import { useStudyTabs } from "./StudyTabs";

export function GuideStepper({ sections }: { sections: GuideSection[] }) {
  const [step, setStep] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const tabs = useStudyTabs();
  const isLast = step === sections.length - 1;

  function goTo(index: number) {
    setStep(index);
    // Jump back to the top of the guide, so the new section starts at its heading.
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-20 space-y-4">
      {/* Step bar: one segment per section. Tapping a segment jumps to that step. */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-600">
          Step {step + 1} of {sections.length}
        </p>
        <div className="flex gap-1">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Go to step ${index + 1}: ${section.heading}`}
              className={`h-2 flex-1 rounded-full transition-colors ${index <= step ? "bg-orange-600" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <GuideSectionCard section={sections[step]} />

      <div className="flex items-center justify-between gap-3">
        <button onClick={() => goTo(step - 1)} disabled={step === 0} className={buttonSecondary}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        {isLast ? (
          <button onClick={() => tabs?.open("tutor")} className={buttonPrimary}>
            <MessageCircle className="h-4 w-4" aria-hidden />
            Practise with the tutor
          </button>
        ) : (
          <button onClick={() => goTo(step + 1)} className={buttonPrimary}>
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
