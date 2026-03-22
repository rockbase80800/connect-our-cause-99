import { Heart, Phone, Mail, MapPin, Building2 } from "lucide-react";
import { useWebsiteSettings } from "@/contexts/WebsiteSettingsContext";

export function Footer() {
  const { settings } = useWebsiteSettings();

  const siteName = settings?.site_name || "Meri Pahal Fast Help";
  const logoUrl = settings?.logo_url;
  const copyright = settings?.footer_content?.copyright || `© ${new Date().getFullYear()} ${siteName}. All rights reserved.`;
  const siteDescription = settings?.description || "Meri Pahal Fast Help Artists Welfare Association (Trust) — Empowering communities through sustainable development, education, and healthcare initiatives.";

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

          {/* Column 2: Contact Us */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+917073741421" className="hover:text-primary-foreground transition-colors">+91 7073741421</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+919351018521" className="hover:text-primary-foreground transition-colors">+91 9351018521</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+916376492883" className="hover:text-primary-foreground transition-colors">+91 6376492883</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:info@meripahafasthelp.org" className="hover:text-primary-foreground transition-colors">info@meripahafasthelp.org</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Jaipur, Rajasthan, India</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Donate Now */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Donate Now</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="font-medium text-primary-foreground">YES BANK</span>
              </li>
              <li>Branch: C-Scheme, Jaipur – 302001</li>
              <li>A/C No: <span className="font-mono text-primary-foreground">002488700000981</span></li>
              <li>IFSC: <span className="font-mono text-primary-foreground">YESB0000024</span></li>
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