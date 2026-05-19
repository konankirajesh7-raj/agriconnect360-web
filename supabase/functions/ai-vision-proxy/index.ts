/**
 * ai-vision-proxy Edge Function — RythuSphere
 * Proxies Gemini Vision API calls server-side for disease detection.
 * 
 * Deploy: supabase functions deploy ai-vision-proxy --project-ref gwetaesjkkrtmhnxuekc
 * Set secret: supabase secrets set GEMINI_API_KEY=xxx --project-ref gwetaesjkkrtmhnxuekc
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { prompt, imageBase64, mimeType } = await req.json();
    if (!prompt || !imageBase64) {
      return new Response(JSON.stringify({ error: "Missing prompt or image" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") || "";
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API key not configured on server" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
          ],
        }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 800 },
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: json?.error?.message || `Gemini error ${res.status}` }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
