import { NewsletterForm } from "@/components/layout/newsletter-form";

export function NewsletterSection() {
  return (
    <section className="bg-offwhite py-16 sm:py-24">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 text-center">
        <h2 className="text-2xl font-medium tracking-tight text-foreground sm:text-3xl">Stay in the Loop</h2>
        <p className="text-sm text-muted-foreground">
          New arrivals, restocks, and the occasional note from the studio — no more than twice a
          month.
        </p>
        <NewsletterForm variant="centered" className="mt-2" />
      </div>
    </section>
  );
}
