export default function Projects() {
  const projects = [
    {
      name: "Code Track",
      href: "https://code-track.vercel.app/",
      repo: "https://github.com/Param302/CodeTrack/",
      stack: ["Next.js", "Tailwind", "GraphQL"],
      description:
        "A focused contribution dashboard that turns GitHub activity into a clean, embeddable portfolio signal.",
    },
    {
      name: "E-Pustakalya",
      href: "https://github.com/Param302/Library-Management-System/",
      repo: "https://github.com/Param302/Library-Management-System/",
      stack: ["Flask", "REST API", "JavaScript"],
      description:
        "An end-to-end library system with API-first backend design and a lightweight user interface.",
    },
    {
      name: "Heart Disease Predictor",
      href: "https://github.com/Param302/Heart-Disease-predictor/",
      repo: "https://github.com/Param302/Heart-Disease-predictor/",
      stack: ["ANN", "TensorFlow", "Tkinter"],
      description:
        "A desktop prediction workflow that packages machine learning into an accessible application experience.",
    },
  ];

  return (
    <section id="projects" className="section-anchor">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">Projects</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-4xl">
            Selected builds with strong product edges.
          </h2>
        </div>
        <p className="max-w-xl font-description text-sm leading-6 text-prussian-blue/70 dark:text-bright-snow/70 sm:text-base">
          Interface quality, engineering clarity, and practical delivery all matter. These projects reflect that balance.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {projects.map((project) => (
          <article key={project.name} className="glass-card rounded-[2rem] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-heading text-2xl font-semibold text-prussian-blue dark:text-bright-snow">
                  {project.name}
                </h3>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex font-description text-sm text-sky-surge transition hover:text-prussian-blue dark:hover:text-papaya-whip"
                >
                  View project
                </a>
              </div>
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-alice-blue/70 bg-bright-snow/60 p-3 text-prussian-blue transition hover:border-sky-surge hover:text-sky-surge dark:border-alice-blue/10 dark:bg-prussian-blue/70 dark:text-bright-snow"
                aria-label={`Open ${project.name} repository`}
              >
                <img src="/github.svg" alt="" className="h-5 w-5" />
              </a>
            </div>

            <p className="mt-5 font-description text-sm leading-7 text-prussian-blue/75 dark:text-bright-snow/75">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-sky-surge/15 bg-sky-surge/10 px-3 py-1 font-description text-xs uppercase tracking-[0.2em] text-prussian-blue dark:text-bright-snow"
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
