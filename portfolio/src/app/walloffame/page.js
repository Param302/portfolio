import { allFeedbacks } from "@/app/data/teachingImpactData";
import WallOfFameClient from "@/app/walloffame/WallOfFameClient";

export const metadata = { title: "Wall of Fame | itsparam.in", description: "Anonymous learner feedback from Parampreet Singh's Python and machine learning sessions.", alternates: { canonical: "/walloffame" } };

export default function WallOfFamePage() {
  return <WallOfFameClient feedbacks={allFeedbacks} />;
}
