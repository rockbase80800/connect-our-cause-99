import { Heart } from "lucide-react";
import { useWebsiteSettings } from "@/contexts/WebsiteSettingsContext";

export function Footer() {
  const { settings } = useWebsiteSettings();

  const siteName = settings?.site_name || "JanSeva";
  const logoUrl = settings?.logo_url;
  const copyright = settings?.footer_content?.copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const contact = settings?.footer_content?.contact || "info@janseva.org\n+91 98765 43210\nDistrict Office, Ranchi, Jharkhand";
  const siteDescription = settings?.description || "Empowering rural communities through sustainable development, education, and healthcare initiatives since 2018.";

  return (
    <footer id="contact" className="bg-primary py-16 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain brightness-0 invert" />
              ) : (
                <Heart className="h-6 w-6 text-accent fill-accent/20" />
              )}
              <span className="font-display text-xl font-semibold text-primary-foreground">
                {siteName}
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {siteDescription}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><a href="#projects" className="hover:text-primary-foreground transition-colors">Our Projects</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="/auth" className="hover:text-primary-foreground transition-colors">Join as Volunteer</a></li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              {contact.split("\n").map((line: string, i: number) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          {copyright}
        </div>
      </div>
    </footer>
  );
}
