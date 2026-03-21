import About from "@/app/components/About";
import Contact from "@/app/components/Contact";
import GurmatDarbarSpotlight from "@/app/components/GurmatDarbarSpotlight";
import HeroSection from "@/app/components/HeroSection";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import Work from "@/app/components/Work";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <About />
      <GurmatDarbarSpotlight />
      <Work />
      <Projects />
      <Contact />
    </main>
  );
}
