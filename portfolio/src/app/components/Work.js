const highlights = [
  "Built and shipped web products across learning, automation, and community operations.",
  "Operate comfortably between AI workflows, frontend delivery, and backend product thinking.",
  "Prefer practical systems that are clear to use, maintain, and extend.",
];

const communityWork = [
  "Presented a talk on Python one-liners and taught Python and machine learning sessions live.",
  "Helped lead a large coding community and created Discord bots for verification and event management.",
  "Served as web admin for college societies, delivering websites with a strong emphasis on usability.",
];

export default function Work() {
  return (
    <section id="work" className="section-anchor">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">Work</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-4xl">
            Technical depth with a founder-style bias for momentum.
          </h2>
          <div className="mt-6 rounded-[1.5rem] border border-alice-blue/70 bg-bright-snow/45 p-5 dark:border-alice-blue/10 dark:bg-ink-black/35">
            <p className="font-heading text-lg text-prussian-blue dark:text-bright-snow">
              Indian Institute of Technology Madras
            </p>
            <p className="mt-2 font-description text-sm uppercase tracking-[0.25em] text-sky-surge">
              B.S. Data Science & Applications
            </p>
            <div className="mt-4 flex flex-wrap gap-3 font-description text-sm text-prussian-blue/70 dark:text-bright-snow/70">
              <span className="rounded-full bg-sky-surge/10 px-3 py-1">2022 - Present</span>
              <span className="rounded-full bg-papaya-whip/70 px-3 py-1 text-prussian-blue">CGPA 8.3</span>
            </div>
          </div>
          <ul className="mt-6 space-y-3 font-description text-sm leading-7 text-prussian-blue/75 dark:text-bright-snow/75">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-sky-surge" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card rounded-[2rem] p-6 sm:p-8">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-sky-surge">Community</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-prussian-blue dark:text-bright-snow sm:text-3xl">
            Teaching, speaking, and building for real audiences.
          </h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-alice-blue/70 bg-bright-snow/45 p-4 dark:border-alice-blue/10 dark:bg-ink-black/35">
              <p className="font-accent text-3xl italic text-sky-surge">100+</p>
              <p className="mt-2 font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Peers taught live in Python and ML sessions.</p>
            </div>
            <div className="rounded-[1.5rem] border border-alice-blue/70 bg-bright-snow/45 p-4 dark:border-alice-blue/10 dark:bg-ink-black/35">
              <p className="font-accent text-3xl italic text-sky-surge">1L+</p>
              <p className="mt-2 font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Students reached through community leadership and technical content.</p>
            </div>
            <div className="rounded-[1.5rem] border border-alice-blue/70 bg-bright-snow/45 p-4 dark:border-alice-blue/10 dark:bg-ink-black/35">
              <p className="font-accent text-3xl italic text-sky-surge">2</p>
              <p className="mt-2 font-description text-sm text-prussian-blue/75 dark:text-bright-snow/75">Society websites delivered as web admin.</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3 font-description text-sm leading-7 text-prussian-blue/75 dark:text-bright-snow/75">
            {communityWork.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-papaya-whip" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
