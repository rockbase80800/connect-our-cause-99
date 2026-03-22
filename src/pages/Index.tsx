import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <StatsSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
