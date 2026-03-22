import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TeamSlider } from "@/components/home/TeamSlider";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProjectsSection />
      <StatsSection />
      <AboutSection />
      <TeamSlider />
      <Footer />
    </div>
  );
};

// sync trigger

export default Index;
