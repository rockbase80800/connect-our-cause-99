import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface AboutCardData {
  title: string;
  description: string;
  about_text: string;
  images: string[];
}

export function AboutCardSection() {
  const [data, setData] = useState<AboutCardData | null>(null);
  const { ref, isVisible } = useScrollReveal(0.15);

  useEffect(() => {
    supabase
      .from("homepage_about_card")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data: row, error }) => {
        if (error) {
          console.error("AboutCardSection fetch error:", error);
          return;
        }
        if (row) {
          setData({
            title: row.title ?? "",
            description: row.description ?? "",
            about_text: row.about_text ?? "",
            images: Array.isArray(row.images) ? (row.images as string[]) : [],
          });
        }
      });
  }, []);

  if (!data) return null;

  return (
    <section className="py-20 md:py-28 section-padding bg-background">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div
          className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Text */}
          <div className="space-y-5">
            <h2 className="text-display text-2xl md:text-4xl text-foreground leading-tight">
              {data.title}
            </h2>
            {data.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {data.description}
              </p>
            )}
            {data.about_text && (
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {data.about_text}
              </p>
            )}
          </div>

          {/* Images */}
          {data.images.length > 0 && (
            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {data.images.length === 1 ? (
                <img
                  src={data.images[0]}
                  alt={data.title}
                  className="w-full rounded-2xl object-cover max-h-[420px] shadow-lg"
                />
              ) : (
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {data.images.map((url, i) => (
                      <CarouselItem key={i}>
                        <img
                          src={url}
                          alt={`${data.title} ${i + 1}`}
                          className="w-full rounded-2xl object-cover max-h-[420px]"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-4 md:-left-6" />
                  <CarouselNext className="-right-4 md:-right-6" />
                </Carousel>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
