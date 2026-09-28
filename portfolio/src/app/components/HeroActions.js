import { BriefcaseBusiness, MailPlus } from "lucide-react";

export default function HeroActions({ className = "", ...props }) {
  return (
    <div className={`flex flex-col items-center gap-5 sm:flex-row sm:gap-8 ${className}`} {...props}>
      <a
        href="#work"
        className="group inline-flex min-w-52 items-center justify-center gap-2 rounded-full border-4 border-ink-black/85 bg-sky-surge px-8 py-4 font-description text-lg font-bold text-ink-black shadow-md transition hover:-translate-y-1 hover:shadow-lg"
      >
        <BriefcaseBusiness aria-hidden="true" className="h-5 w-5 transition group-hover:rotate-[-6deg]" />
        View Work
      </a>
      <a
        href="#contact"
        className="group inline-flex min-w-52 items-center justify-center gap-2 rounded-full border-4 border-prussian-blue/80 bg-papaya-whip px-8 py-4 font-description text-lg font-bold text-prussian-blue shadow-md transition hover:-translate-y-1 hover:shadow-lg"
      >
        <MailPlus aria-hidden="true" className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        Reach Out
      </a>
    </div>
  );
}
