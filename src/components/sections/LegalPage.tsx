import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { Wordmark } from "@/components/ui/Wordmark";
import { Footer } from "./Footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="h-16 border-b border-hairline">
        <Container className="flex h-full items-center justify-between">
          <Link href="/" aria-label="Motiondeck home" className="rounded-md">
            <Wordmark />
          </Link>
          <Link href="/" className="rounded-sm text-[15px] text-muted hover:text-ink">
            Back to home
          </Link>
        </Container>
      </header>
      <main>
        <Container className="py-24 md:py-32">
          <article className="max-w-[640px]">
            <p className="eyebrow text-muted">Last updated {updated}</p>
            <h1 className="mt-4 text-h2">{title}</h1>
            <div className="mt-10 flex flex-col gap-6 text-body text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-4 [&_h2]:text-[22px] [&_h2]:font-medium [&_h2]:tracking-[-0.02em] [&_h2]:text-ink">
              {children}
            </div>
          </article>
        </Container>
      </main>
      <Footer />
    </>
  );
}
