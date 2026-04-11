"use client";

import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const experiences = [
  {
    role: "Founder",
    company: "Gurmat Darbar",
    dates: "Sept 2025 – Present",
    points: [
      "Built a Full-Stack platform for the Sikh community featuring 'Find Samagams Near Me', covering 150+ Samagams with 200+ contributions.",
      "Engineered a GenAI pipeline for structured multilingual data extraction and auto-poster generation.",
    ],
  },
  {
    role: "AI Research Intern",
    company: "mPragati Lab, IIT Delhi",
    dates: "Sept 2025 – Present",
    points: [
      "Working on 3D skull implant generation using deep learning for biomedical reconstruction.",
      "Creating and training 3D U-Net based architectures for skull implant reconstruction.",
    ],
  },
  {
    role: "Junior Applications Engineer",
    company: "Coridors",
    dates: "Aug 2024 – Sep 2025",
    points: [
      "Built a Streamlit-based data ingestion platform with 30+ interactive screens integrated with Snowflake.",
      "Worked on backend integrations with Snowflake Snowpark for scalable data workflows.",
      "Designed, deployed, and maintained the company website using JavaScript and Tailwind CSS via Vercel and Cloudflare.",
    ],
  },
  {
    role: "Educator",
    company: "YouTube (@Param3021)",
    dates: "Jan 2023 – Present",
    points: [
      "Delivered 70+ live sessions on Python and ML, reaching 100K+ learners.",
    ],
  },
];

export default function Work() {
  return (
    <section id="work" className="section-anchor bg-background px-4 py-16 sm:px-8 sm:py-20 lg:px-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 sm:mb-12">
          <h2 className="inline-block font-accent text-5xl font-bold italic tracking-tight text-prussian-blue dark:text-bright-snow sm:text-6xl lg:text-7xl">
            Work Experience
          </h2>
        </div>

        <div className="relative pl-0 sm:pl-8">
          <div className="absolute bottom-0 left-3 top-0 hidden w-px bg-alice-blue dark:bg-prussian-blue sm:block" />

          <div className="space-y-5">
            {experiences.map((experience, index) => (
              <motion.article
                key={`${experience.role}-${experience.company}`}
                initial={{ opacity: 0, y: 48, rotateX: 8, rotate: -1.5 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.28 }}
                transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top center" }}
                className="relative rounded-[1.75rem] border border-alice-blue bg-white p-6 shadow-[0_12px_32px_rgba(11,15,25,0.04)] transition hover:border-sky-surge/25 dark:border-alice-blue/10 dark:bg-prussian-blue dark:shadow-none dark:hover:shadow-[0_0_30px_rgba(27,182,224,0.08)] sm:p-7"
              >
                <span className="absolute left-[-1.92rem] top-8 hidden h-4 w-4 rounded-full border-2 border-sky-surge bg-bright-snow dark:bg-ink-black sm:inline-flex" />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-bold tracking-tight text-prussian-blue dark:text-bright-snow">
                      {experience.role}
                    </h3>
                    <p className="mt-1 font-description text-base font-medium text-prussian-blue/72 dark:text-bright-snow/72">
                      {experience.company}
                    </p>
                  </div>
                  <p className="font-accent text-xl italic text-[#d38d55] dark:text-papaya-whip">
                    {experience.dates}
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  {experience.points.map((point) => (
                    <div key={point} className="flex gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-surge/12 text-sky-surge">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                      <p className="font-description text-sm leading-7 text-prussian-blue/78 dark:text-bright-snow/78 sm:text-[0.96rem]">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
