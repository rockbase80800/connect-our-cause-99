import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebsiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  description: string | null;
  header_content: any;
  footer_content: any;
  updated_at: string;
}

interface WebsiteSettingsContextType {
  settings: WebsiteSettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const WebsiteSettingsContext = createContext<WebsiteSettingsContextType | undefined>(undefined);

export function WebsiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from("website_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (error) console.error("Settings fetch error:", error);
    if (data) setSettings(data as WebsiteSettings);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Dynamic favicon
  useEffect(() => {
    if (settings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings?.favicon_url]);

  // Dynamic title & meta description
  useEffect(() => {
    if (settings?.site_name) {
      document.title = settings.site_name;
    }
    if (settings?.description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", settings.description);
    }
  }, [settings?.site_name, settings?.description]);

  return (
    <WebsiteSettingsContext.Provider value={{ settings, loading, refresh: fetchSettings }}>
      {children}
    </WebsiteSettingsContext.Provider>
  );
}

export function useWebsiteSettings() {
  const context = useContext(WebsiteSettingsContext);
  if (!context) throw new Error("useWebsiteSettings must be used within WebsiteSettingsProvider");
  return context;
}
