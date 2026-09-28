import { allFeedbacks } from "@/app/data/teachingImpactData";
import WallOfFameClient from "@/app/walloffame/WallOfFameClient";
import { loadWallFeedbacks } from "@/lib/wall-feedback";

export const metadata = { title: "Wall of Fame | itsparam.in", description: "Anonymous learner feedback from Parampreet Singh's Python and machine learning sessions.", alternates: { canonical: "/walloffame" } };
export const dynamic = "force-dynamic";

export default async function WallOfFamePage() {
  const feedbacks = await loadWallFeedbacks(allFeedbacks);
  return <WallOfFameClient feedbacks={feedbacks} />;
}
