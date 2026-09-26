"use client";

import { useId, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

const faqs = [
  {
    question: "Is it free to try?",
    answer: "Yes. The free plan includes 3 decks a month. Exports carry a small watermark.",
  },
  {
    question: "What can I export?",
    answer: "MP4 video (up to 4K on Pro), PDF, or a share link.",
  },
  {
    question: "Can I edit what the AI makes?",
    answer:
      "Yes. You approve the outline first, then edit any slide's text, animation and timing, or regenerate a single slide.",
  },
  {
    question: "Does it work for live presenting?",
    answer: "Yes. Present mode runs fullscreen in your browser. Arrow keys move between slides.",
  },
  { question: "Can I use my brand colors?", answer: "Pro plan, coming soon." },
  { question: "Who owns what I create?", answer: "You do." },
];

export function FaqList() {
  return (
    <ul className="border-t border-hairline">
      {faqs.map((faq) => (
        <FaqItem key={faq.question} {...faq} />
      ))}
    </ul>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <li className="border-b border-hairline">
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-[20px] leading-7 font-medium tracking-[-0.015em]"
        >
          {question}
          {/* A plus that turns into an x. */}
          <span
            aria-hidden="true"
            className={cn(
              "relative grid size-8 shrink-0 place-items-center rounded-full border border-hairline-strong transition-transform duration-300 ease-brand",
              open && "rotate-45",
            )}
          >
            <span className="absolute h-px w-3 bg-ink" />
            <span className="absolute h-3 w-px bg-ink" />
          </span>
        </button>
      </h3>
      {/* Height animates here on purpose: the one exception to transform-and-opacity. */}
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
          >
            <p className="max-w-[600px] pr-10 pb-7 text-body text-muted">{answer}</p>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
}
