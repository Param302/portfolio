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
  siteConfig,
} from "@/app/data/seoData";
import { listPublicImages } from "@/lib/media";
import { formatCompactCount, getPublishedResume, getYouTubeStats } from "@/lib/resume-content";

export async function generateMetadata() {
  const { content } = await getPublishedResume();
  const title = `${content.profile.name} | ${content.profile.headline} Portfolio`;
  return {
    title,
    description: content.summary,
    alternates: { canonical: "/" },
    openGraph: { title, description: content.summary, url: siteConfig.url, images: [`${siteConfig.url}/og-image.png`] },
    twitter: { card: "summary_large_image", title, description: content.summary, images: [`${siteConfig.url}/og-image.png`] },
  };
}

export default async function Home() {
  const [{ content }, youtubeStats, gurmatScreenshots, codexImages, pyDelhiImages] = await Promise.all([
    getPublishedResume(),
    getYouTubeStats(),
    listPublicImages("media/gurmat-darbar", ["/gurmatdarbar.png"]),
    listPublicImages("media/community/codex", ["/parampreet_singh.png"]),
    listPublicImages("media/community/pydelhi", ["/parampreet.png"]),
  ]);
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: content.projects.map((project, index) => ({
      "@type": "SoftwareSourceCode",
      position: index + 1,
      name: project.name,
      description: project.description,
      codeRepository: project.links.find((link) => link.label.toLowerCase().includes("github"))?.href,
      keywords: project.skills.join(", "),
      author: { "@type": "Person", name: content.profile.name },
    })),
  };
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${content.profile.name} | ${content.profile.headline}`,
    url: siteConfig.url,
    description: content.summary,
    mainEntity: { "@type": "Person", name: content.profile.name, jobTitle: content.profile.headline, email: content.profile.email, sameAs: content.profile.socials.map((link) => link.href) },
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
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
      <HeroSection headline={content.profile.headline} summary={content.summary} />
      <About content={content} />
      <CommunitySection codexImages={codexImages} pyDelhiImages={pyDelhiImages} subscriberLabel={formatCompactCount(youtubeStats?.subscriber_count)} />
      <GurmatDarbarSpotlight screenshots={gurmatScreenshots} />
      <Work experiences={content.experience} />
      <Projects projects={content.projects} />
      <Contact />
      <Footer />
    </main>
  );
}
