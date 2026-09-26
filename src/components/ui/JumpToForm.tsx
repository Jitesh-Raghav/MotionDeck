"use client";

export const FORM_IDS = {
  hero: "early-access",
  "final-cta": "waitlist",
} as const;

type JumpToFormProps = {
  target: keyof typeof FORM_IDS;
  className?: string;
  children: React.ReactNode;
};

/** Link that scrolls to an email form and focuses its input. */
export function JumpToForm({ target, className, children }: JumpToFormProps) {
  const id = FORM_IDS[target];
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        const input = document.getElementById(`${id}-email`);
        if (!input) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        input.closest("form")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "center",
        });
        input.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
