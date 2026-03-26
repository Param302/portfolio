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
    "AI/ML Engineer specialized in building production-grade AI systems, focused on SLM fine-tuning and scaling Gurmat Darbar, with 70+ live Python and ML sessions delivered to 100K+ learners.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Parampreet Singh | AI Engineer Portfolio",
    description:
      "Production-grade AI systems, SLM fine-tuning work, Gurmat Darbar scaling journey, and practical ML impact by Parampreet Singh.",
    url: siteConfig.url,
    images: [`${siteConfig.url}/og-image.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parampreet Singh | AI Engineer Portfolio",
    description:
      "AI/ML Engineer portfolio: SLM fine-tuning, full-stack AI systems, and teaching impact by Parampreet Singh (@Param3021).",
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
