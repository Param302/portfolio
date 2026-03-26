import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Resume | itsparam.in",
  description:
    "Resume of Parampreet Singh, AI engineer and educator focused on machine learning systems, product execution, and developer-first solutions.",
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    title: "Resume | Parampreet Singh",
    description:
      "View Parampreet Singh's resume with experience, focus areas, and contact details.",
    url: "https://itsparam.in/resume",
    images: ["https://itsparam.in/og-image-square.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume | Parampreet Singh",
    description:
      "Resume of Parampreet Singh, AI engineer and educator.",
    images: ["https://itsparam.in/og-image-square.png"],
  },
};

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:items-center">
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
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">Resume Route</p>
            <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-5xl lg:text-6xl">
              Parampreet Singh
            </h1>
            <p className="mt-3 font-accent text-2xl italic text-papaya-whip sm:text-3xl">
              AI / GenAI Engineer
            </p>
            <p className="mt-6 max-w-2xl font-description text-base leading-8 text-prussian-blue/78 dark:text-bright-snow/78">
              This route is now active, so the resume CTA works properly across the portfolio. It can later be swapped for a downloadable PDF, a hosted document, or a richer resume page without changing the navigation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:hey@itsparam.in"
                className="inline-flex items-center justify-center rounded-full bg-sky-surge px-6 py-3 font-heading text-sm font-semibold text-ink-black transition hover:-translate-y-0.5"
              >
                Contact Me
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-prussian-blue/16 bg-bright-snow px-6 py-3 font-heading text-sm font-semibold text-prussian-blue transition hover:-translate-y-0.5 hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue dark:text-bright-snow"
              >
                Back to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
