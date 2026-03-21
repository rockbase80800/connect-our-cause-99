import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Community gathering in rural India"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
        <div className="max-w-2xl">
          <p
            className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            Empowering Communities Since 2018
          </p>
          <h1
            className="text-display text-4xl md:text-6xl lg:text-7xl mb-6 animate-reveal-up"
            style={{ animationDelay: "350ms", color: "hsl(40 33% 98%)" }}
          >
            Building Stronger
            <br />
            Communities Together
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed mb-10 animate-reveal-up"
            style={{ animationDelay: "500ms", color: "hsl(40 20% 82%)" }}
          >
            We work at the grassroots level — from panchayats to districts — to
            bring sustainable change through education, healthcare, and clean
            water initiatives.
          </p>
          <div
            className="flex flex-wrap gap-4 animate-reveal-up"
            style={{ animationDelay: "650ms" }}
          >
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 active:scale-[0.97] transition-all shadow-lg shadow-accent/25 text-base px-8 py-6"
              >
                Join Our Mission
              </Button>
            </Link>
            <a href="#projects">
              <Button
                size="lg"
                variant="outline"
                className="border-2 font-semibold text-base px-8 py-6 active:scale-[0.97] transition-all"
                style={{
                  borderColor: "hsl(40 20% 82% / 0.3)",
                  color: "hsl(40 33% 98%)",
                  backgroundColor: "transparent",
                }}
              >
                View Projects
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-reveal-up"
        style={{ animationDelay: "900ms" }}
      >
        <div className="max-w-7xl mx-auto px-6 pb-8">
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: "12,400+", label: "Lives Impacted" },
              { value: "38", label: "Active Projects" },
              { value: "6", label: "Districts Covered" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-2xl md:text-3xl font-bold" style={{ color: "hsl(36 85% 55%)" }}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm mt-1" style={{ color: "hsl(40 20% 72%)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
