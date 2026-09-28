import { pageMetadata, publicPageStructuredData, serializeJsonLd } from "@/app/data/seoData";
import { getPublishedResume } from "@/lib/resume-content";
import { allFeedbacks } from "@/app/data/teachingImpactData";
import WallOfFameClient from "@/app/walloffame/WallOfFameClient";
import { loadWallFeedbacks } from "@/lib/wall-feedback";

const title = "Feedbacks of sessions by Parampreet Singh";
const description = "Learner feedback from Python and machine learning sessions, tutorials, practice and revision sessions by Parampreet Singh (@Param3021).";
export const metadata = pageMetadata(title, description, "/walloffame");
export const dynamic = "force-dynamic";

export default async function WallOfFamePage() {
  const [feedbacks, { content }] = await Promise.all([loadWallFeedbacks(allFeedbacks), getPublishedResume()]);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(publicPageStructuredData(content, "/walloffame", title, description, "CollectionPage")) }} />
    <WallOfFameClient feedbacks={feedbacks} />
  </>;
}
