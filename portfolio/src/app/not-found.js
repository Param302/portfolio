import Image from "next/image";
import Link from "next/link";

import ForwardPassNetwork from "@/app/components/ForwardPassNetwork";
import SelfAttentionPlayground from "@/app/components/SelfAttentionPlayground";

export const metadata = {
  title: "404 | Page Not Found",
  description: "The requested page was not found on itsparam.in.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.36fr_0.64fr] lg:items-center">
          <div className="glass-card rounded-[2.5rem] p-4">
            <div className="overflow-hidden rounded-[2rem] border border-alice-blue/70 bg-bright-snow dark:border-alice-blue/10 dark:bg-prussian-blue">
              <Image
                src="/parampreet_singh.png"
                alt="Portrait of Parampreet Singh"
                width={720}
                height={920}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">404 / Model Trace</p>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-5xl lg:text-6xl">
              The page is missing. The network is still thinking.
            </h1>
            <p className="mt-3 font-accent text-2xl italic text-papaya-whip sm:text-3xl">
              Parampreet Singh
            </p>
            <p className="mt-6 max-w-2xl font-description text-base leading-8 text-prussian-blue/78 dark:text-bright-snow/78">
              This fallback route still carries the portfolio language. First comes a sparse forward-pass simulation inspired by deep neural networks, then a self-attention field that links the ideas behind the work, research, teaching, and products.
            </p>
            <p className="mt-3 font-description text-sm uppercase tracking-[0.22em] text-prussian-blue/50 dark:text-bright-snow/50">
              Forward Pass first. Self-Attention next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-sky-surge px-6 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5"
              >
                Back to Home
              </Link>
              <Link
                href="/resume"
                className="inline-flex items-center justify-center rounded-full border border-prussian-blue/16 bg-bright-snow px-6 py-3 font-heading text-sm font-semibold text-prussian-blue transition hover:-translate-y-0.5 hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
              >
                Open Resume
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ForwardPassNetwork />
      <SelfAttentionPlayground />
    </main>
  );
}

