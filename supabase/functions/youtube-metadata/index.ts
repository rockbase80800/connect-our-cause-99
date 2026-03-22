import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { youtube_url } = await req.json();
    if (!youtube_url) throw new Error("youtube_url is required");

    const videoId = extractYouTubeId(youtube_url);
    if (!videoId) throw new Error("Invalid YouTube URL");

    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Fetch page to get title via oEmbed (no API key needed)
    let title = "";
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        title = data.title || "";
      }
    } catch {
      title = "";
    }

    // Generate AI description using Lovable AI
    let description = "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY && title) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant. Write a short engaging description (2-3 sentences, in Hindi) for a YouTube video based on its title. Keep it informative and interesting.",
              },
              { role: "user", content: `YouTube video title: "${title}"` },
            ],
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          description = aiData.choices?.[0]?.message?.content || "";
        }
      } catch {
        description = "";
      }
    }

    return new Response(
      JSON.stringify({ youtube_id: videoId, title, thumbnail_url: thumbnail, description }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
