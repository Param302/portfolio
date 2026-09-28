import { profileResponse, renderPublicIndex } from "@/lib/public-profile";

export const dynamic = "force-dynamic";

export function GET() {
  return profileResponse(renderPublicIndex(), "text/plain");
}
