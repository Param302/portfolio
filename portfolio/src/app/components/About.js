export default function About() {
  return (
    <section id="about" className="section-anchor">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">
            About
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-4xl">
            Product-minded AI engineer building interfaces and systems that stay elegant under pressure.
          </h2>
          <p className="mt-5 max-w-2xl font-description text-base leading-7 text-prussian-blue/75 dark:text-bright-snow/75 sm:text-lg">
            I work across machine learning, frontend delivery, and developer tooling. The focus is practical:
            ship useful experiences, make them feel deliberate, and keep the system maintainable when the scope grows.
          </p>
        </article>

        <article className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">
            Snapshot
          </p>
          <div className="mt-5 space-y-5 font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75 sm:text-base">
            <div>
              <p className="font-heading text-lg text-prussian-blue dark:text-bright-snow">Current focus</p>
              <p className="mt-1">AI-first products, polished user experience, and full-stack execution with clear technical tradeoffs.</p>
            </div>
            <div>
              <p className="font-heading text-lg text-prussian-blue dark:text-bright-snow">Base</p>
              <p className="mt-1">Indian Institute of Technology Madras, Data Science & Applications.</p>
            </div>
            <div>
              <p className="font-heading text-lg text-prussian-blue dark:text-bright-snow">Approach</p>
              <p className="mt-1">Prototype fast, tighten the interface, and leave the codebase easier to evolve than I found it.</p>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
