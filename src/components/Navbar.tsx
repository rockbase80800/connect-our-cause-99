import { Link } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWebsiteSettings } from "@/contexts/WebsiteSettingsContext";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useWebsiteSettings();

  const siteName = settings?.site_name || "JanSeva";
  const logoUrl = settings?.logo_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <Heart className="h-7 w-7 text-primary fill-primary/20" />
          )}
          <span className="font-display text-xl font-semibold text-foreground">
            {siteName}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Projects
          </a>
          <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </a>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
          <Link to="/auth">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.97] transition-all">
              Join Now
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 animate-reveal-up">
          <div className="flex flex-col gap-3">
            <a href="#projects" className="text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Projects</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>About</a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground py-2" onClick={() => setMobileOpen(false)}>Contact</a>
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-primary text-primary-foreground">Join Now</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
