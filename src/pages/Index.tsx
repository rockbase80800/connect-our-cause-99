import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  console.log("Homepage Loaded");

  return (
    <>
      <div className="px-10 py-8 text-foreground">Homepage Working</div>
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <Footer />
    </>
  );
};

export default Index;
