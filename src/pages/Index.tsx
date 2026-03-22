import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { TeamSlider } from "@/components/home/TeamSlider";
import { Footer } from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ErrorBoundary>
        <HeroSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <StatsSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <AboutSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <ProjectsSection />
      </ErrorBoundary>
      <ErrorBoundary>
        <TeamSlider />
      </ErrorBoundary>
      <Footer />
    </div>
  );
};

export default Index;
