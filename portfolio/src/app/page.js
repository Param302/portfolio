import About from "@/app/components/About";
import CommunitySection from "@/app/components/CommunitySection";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";
import GurmatDarbarSpotlight from "@/app/components/GurmatDarbarSpotlight";
import HeroSection from "@/app/components/HeroSection";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import Work from "@/app/components/Work";
import {
  breadcrumbSchema,
  projectItemListSchema,
  siteConfig,
} from "@/app/data/seoData";
import { listPublicImages } from "@/lib/media";
import { formatCompactCount, getPublishedResume, getYouTubeStats } from "@/lib/resume-content";

export async function generateMetadata() {
  const title = "Parampreet Singh | AI Engineer Portfolio";
  const description = siteConfig.shortBio;
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: siteConfig.url, images: [`${siteConfig.url}/og-image.png`] },
    twitter: { card: "summary_large_image", title, description, images: [`${siteConfig.url}/og-image.png`] },
  };
}

export default async function Home() {
  const [{ content }, youtubeStats, gurmatScreenshots, codexImages, pyDelhiImages, extraImages] = await Promise.all([
    getPublishedResume(),
    getYouTubeStats(),
    listPublicImages("media/gurmat-darbar", ["/gurmatdarbar.png"]),
    listPublicImages("media/community/codex", ["/parampreet_singh.png"]),
    listPublicImages("media/community/pydelhi", ["/parampreet.png"]),
    listPublicImages("media/community/extras"),
  ]);
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Parampreet Singh | AI Engineer",
    url: siteConfig.url,
    description: siteConfig.shortBio,
    mainEntity: { "@type": "Person", name: siteConfig.name, jobTitle: "AI Engineer", email: siteConfig.email, sameAs: siteConfig.sameAs },
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectItemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <HeroSection />
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
