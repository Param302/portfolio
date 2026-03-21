import About from "@/app/components/About";
import Contact from "@/app/components/Contact";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import Work from "@/app/components/Work";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 pb-32 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pt-36">
        <section id="home" className="section-anchor">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="glass-card rounded-[2rem] p-6 sm:p-8 lg:p-10">
              <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">
                Aesthetic Tech
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-5xl lg:text-6xl">
                Parampreet Singh builds{" "}
                <span className="font-accent italic text-sky-surge">AI experiences</span>{" "}
                with clean systems and sharper interfaces.
              </h1>
              <p className="mt-6 max-w-2xl font-description text-base leading-7 text-prussian-blue/75 dark:text-bright-snow/75 sm:text-lg">
                AI engineer, builder, and educator focused on turning machine learning ideas into usable, production-aware products.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center rounded-full bg-sky-surge px-5 py-3 font-heading text-sm font-semibold text-ink-black transition hover:shadow-cta-glow"
                >
                  View Projects
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-full border border-alice-blue/70 bg-bright-snow/55 px-5 py-3 font-heading text-sm font-semibold text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue/55 dark:text-bright-snow"
                >
                  Let&apos;s Talk
                </a>
              </div>
            </article>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <article className="glass-card rounded-[2rem] p-6">
                <p className="font-accent text-4xl italic text-sky-surge">AI</p>
                <p className="mt-3 font-heading text-xl text-prussian-blue dark:text-bright-snow">Engineer-first thinking</p>
                <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/75 dark:text-bright-snow/75">
                  Systems that balance experimentation, usability, and maintainability.
                </p>
              </article>
              <article className="glass-card rounded-[2rem] p-6">
                <p className="font-accent text-4xl italic text-sky-surge">UI</p>
                <p className="mt-3 font-heading text-xl text-prussian-blue dark:text-bright-snow">Deliberate product feel</p>
                <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/75 dark:text-bright-snow/75">
                  Thoughtful motion, visual hierarchy, and interfaces that feel designed rather than assembled.
                </p>
              </article>
              <article className="glass-card rounded-[2rem] p-6">
                <p className="font-accent text-4xl italic text-sky-surge">Ship</p>
                <p className="mt-3 font-heading text-xl text-prussian-blue dark:text-bright-snow">Execution without drift</p>
                <p className="mt-2 font-description text-sm leading-6 text-prussian-blue/75 dark:text-bright-snow/75">
                  From prototypes to deployable portfolios, the output stays grounded in working software.
                </p>
              </article>
            </div>
          </div>
        </section>

        <About />
        <Work />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
