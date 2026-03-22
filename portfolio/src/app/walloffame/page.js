import { feedbacks } from "@/app/data/teachingImpactData";

const allFeedbacks = [...feedbacks.row1, ...feedbacks.row2, ...feedbacks.row3];

export const metadata = {
  title: "Wall of Fame | itsparam.dev",
  description:
    "Learner testimonials, teaching impact, and student feedback from Python and machine learning sessions by Parampreet Singh.",
  alternates: {
    canonical: "/walloffame",
  },
  openGraph: {
    title: "Wall of Fame | Parampreet Singh",
    description:
      "Real student feedback and teaching impact from Python and machine learning sessions.",
    url: "https://itsparam.dev/walloffame",
    images: ["https://itsparam.dev/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wall of Fame | Parampreet Singh",
    description:
      "Student feedback and learning outcomes from Python and machine learning sessions.",
    images: ["https://itsparam.dev/og-image.png"],
  },
};

export default function WallOfFamePage() {
  return (
    <main className="min-h-screen bg-papaya-whip px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-heading text-sm uppercase tracking-[0.3em] text-prussian-blue/70">
            Teaching Impact
          </p>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-prussian-blue sm:text-5xl">
            Wall of Fame
          </h1>
          <p className="mt-3 font-accent text-3xl italic text-prussian-blue/80">
            Notes from learners, live sessions, and revision marathons.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {allFeedbacks.map((feedback, index) => (
            <article
              key={`${index}-${feedback.slice(0, 18)}`}
              className="rounded-[1.5rem] bg-bright-snow p-5 text-sm leading-7 text-prussian-blue shadow-[0_12px_30px_rgba(11,15,25,0.06)] dark:bg-prussian-blue dark:text-bright-snow"
            >
              {feedback}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
