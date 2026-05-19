/**
 * ai-proxy Edge Function — RythuSphere
 * Proxies AI requests to Groq/Gemini, keeping API keys server-side only.
 * 
 * Deploy: supabase functions deploy ai-proxy --project-ref gwetaesjkkrtmhnxuekc
 * Set secrets:
 *   supabase secrets set GROQ_API_KEY=xxx --project-ref gwetaesjkkrtmhnxuekc
 *   supabase secrets set GEMINI_API_KEY=xxx --project-ref gwetaesjkkrtmhnxuekc
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
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
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 10000) {
      return new Response(JSON.stringify({ error: "Invalid prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_KEY = Deno.env.get("GROQ_API_KEY") || "";
    const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") || "";

    let text = "";
    let engine = "";

    // Try Groq first (fastest), fallback to Gemini
    if (GROQ_KEY) {
      try {
        const res = await fetch(GROQ_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          text = data.choices?.[0]?.message?.content || "";
          engine = "Groq LLaMA-3.3-70B";
        }
      } catch {
        /* Groq failed, try Gemini */
      }
    }

    // Fallback to Gemini
    if (!text && GEMINI_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        engine = "Gemini 1.5 Flash";
      }
    }

    if (!text) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable. No API keys configured on server." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ text, engine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
