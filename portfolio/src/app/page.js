import About from "@/app/components/About";
import CommunitySection from "@/app/components/CommunitySection";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";
import GurmatDarbarSpotlight from "@/app/components/GurmatDarbarSpotlight";
import HeroSection from "@/app/components/HeroSection";
import HomeIntro from "@/app/components/HomeIntro";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import Work from "@/app/components/Work";
import {
  homeStructuredData,
  pageMetadata,
  serializeJsonLd,
  siteConfig,
} from "@/app/data/seoData";
import { listPublicImages } from "@/lib/media";
import { formatCompactCount, getPublishedResume, getYouTubeStats } from "@/lib/resume-content";

export const metadata = pageMetadata(siteConfig.title, siteConfig.shortBio, "/");

export default async function Home() {
  const [{ content }, youtubeStats, gurmatScreenshots, codexImages, pyDelhiImages, extraImages] = await Promise.all([
    getPublishedResume(),
    getYouTubeStats(),
    listPublicImages("media/gurmat-darbar", ["/optimized/gurmatdarbar.webp"]),
    listPublicImages("media/community/codex", ["/optimized/parampreet_singh.webp"]),
    listPublicImages("media/community/pydelhi", ["/optimized/parampreet.webp"]),
    listPublicImages("media/community/extras"),
  ]);
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(homeStructuredData(content)) }} />
      <HomeIntro>
        <Navbar />
        <HeroSection />
      </HomeIntro>
      <About />
      <CommunitySection codexImages={codexImages} pyDelhiImages={pyDelhiImages} extraImages={extraImages} subscriberLabel={formatCompactCount(youtubeStats?.subscriber_count)} />
      <GurmatDarbarSpotlight screenshots={gurmatScreenshots} />
      <Work experiences={content.experience} />
      <Projects />
      <Contact />
      <Footer />
    </main>
  );
}
