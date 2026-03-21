import About from "@/app/components/About";
import Contact from "@/app/components/Contact";
import HeroSection from "@/app/components/HeroSection";
import Navbar from "@/app/components/Navbar";
import Projects from "@/app/components/Projects";
import Work from "@/app/components/Work";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-32 sm:px-6 sm:pb-20 lg:px-8">
        <About />
        <Work />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
