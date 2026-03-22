import { Component, ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { ProjectsSection } from "@/components/home/ProjectsSection";
import { StatsSection } from "@/components/home/StatsSection";
import { AboutSection } from "@/components/home/AboutSection";
import { TopAdmins } from "@/components/home/TopAdmins";
import { TeamSlider } from "@/components/home/TeamSlider";
import { Footer } from "@/components/Footer";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: any) { console.error("Section crash:", e); }
  render() { return this.state.hasError ? null : this.props.children; }
}

const Safe = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Safe><HeroSection /></Safe>
      <Safe><AboutSection /></Safe>
      <Safe><TopAdmins /></Safe>
      <Safe><ProjectsSection /></Safe>
      <Safe><StatsSection /></Safe>
      <Safe><TeamSlider /></Safe>
      <Footer />
    </div>
  );
};

export default Index;
