const socialLinks = [
  { label: "GitHub", href: "https://github.com/Param302" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/param302" },
  { label: "X", href: "https://x.com/Param3021" },
];

export default function Contact() {
  return (
    <section id="contact" className="section-anchor">
      <article className="glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div>
            <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">Contact</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-4xl">
              Building something sharp in AI or product engineering?
            </h2>
            <p className="mt-4 max-w-2xl font-description text-base leading-7 text-prussian-blue/75 dark:text-bright-snow/75">
              I am interested in AI engineering, developer tooling, product-focused collaborations, and thoughtful systems work.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-start lg:items-end">
            <a
              href="mailto:hey@itsparam.dev"
              className="inline-flex items-center justify-center rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:shadow-cta-glow"
            >
              hey@itsparam.dev
            </a>
            <p className="font-description text-sm text-prussian-blue/65 dark:text-bright-snow/65">
              Reply-friendly and open to relevant work.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-alice-blue/70 bg-bright-snow/50 px-4 py-2 font-description text-sm text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue/55 dark:text-bright-snow"
            >
              {link.label}
            </a>
          ))}
        </div>
      </article>
    </section>
  );
}
