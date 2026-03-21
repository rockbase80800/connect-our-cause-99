import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

export function DashboardBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    supabase
      .from("banners")
      .select("id, title, description, image_url")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setBanner(data as Banner);
      });
  }, []);

  if (!banner) return null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden mb-6">
      {banner.image_url ? (
        <img src={banner.image_url} alt="" className="w-full h-36 sm:h-48 object-cover" />
      ) : (
        <div className="w-full h-36 sm:h-48 bg-gradient-to-r from-primary/20 to-primary/5" />
      )}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-4 sm:p-6">
        <h2 className="text-white text-lg sm:text-xl font-bold mix-blend-difference">{banner.title}</h2>
        {banner.description && (
          <p className="text-white/80 text-sm mt-1 line-clamp-2 mix-blend-difference">{banner.description}</p>
        )}
      </div>
    </div>
  );
}
