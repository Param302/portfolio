import { getPublishedResume } from "@/lib/resume-content";
import { profileResponse, renderPublicProfile } from "@/lib/public-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const { content } = await getPublishedResume();
  return profileResponse(renderPublicProfile(content), "text/markdown");
}
