import About from "@/app/components/About";
import Contact from "@/app/components/Contact";
import GurmatDarbarSpotlight from "@/app/components/GurmatDarbarSpotlight";
import HeroSection from "@/app/components/HeroSection";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import TeachingImpact from "@/app/components/TeachingImpact";
import Work from "@/app/components/Work";
import { projectItemListSchema, siteConfig } from "@/app/data/seoData";

export const metadata = {
  title: "Parampreet Singh | AI Engineer Portfolio",
  description:
    "Explore Parampreet Singh's machine learning, GenAI, and full-stack portfolio featuring production projects, teaching impact, and collaboration opportunities.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Parampreet Singh | AI Engineer Portfolio",
    description:
      "Machine learning, GenAI, and full-stack portfolio with real projects, research, and practical impact.",
    url: siteConfig.url,
    images: [`${siteConfig.url}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parampreet Singh | AI Engineer Portfolio",
    description:
      "Machine learning, GenAI, and full-stack portfolio with real projects and practical impact.",
    images: [`${siteConfig.url}/og-image.png`],
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectItemListSchema) }}
      />
      <Navbar />
      <HeroSection />
      <About />
      <GurmatDarbarSpotlight />
      <Work />
      <TeachingImpact />
      <Projects />
      <Contact />
    </main>
  );
}
