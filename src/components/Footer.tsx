import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-primary py-16 section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-accent fill-accent/20" />
              <span className="font-display text-xl font-semibold text-primary-foreground">
                JanSeva
              </span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Empowering rural communities through sustainable development,
              education, and healthcare initiatives since 2018.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#projects" className="hover:text-primary-foreground transition-colors">Our Projects</a></li>
              <li><a href="#about" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="/auth" className="hover:text-primary-foreground transition-colors">Join as Volunteer</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>info@janseva.org</li>
              <li>+91 98765 43210</li>
              <li>District Office, Ranchi, Jharkhand</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} JanSeva. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
