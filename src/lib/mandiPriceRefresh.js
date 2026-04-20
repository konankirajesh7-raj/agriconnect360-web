/**
 * mandiPriceRefresh.js — Supabase Edge Function (cron)
 * Scheduled to run daily at 6:00 AM IST
 * Fetches live APMC prices from data.gov.in and upserts into market_prices
 * 
 * Deploy via Supabase Dashboard > Edge Functions
 * Schedule: 0 0 * * * (daily midnight UTC = 5:30 AM IST)
 */

// This file is a template for the Supabase Edge Function.
// Deploy it using the Supabase CLI or Dashboard.

const EDGE_FUNCTION_CODE = `
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DATA_GOV_API = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
const DATA_GOV_KEY = Deno.env.get("DATA_GOV_API_KEY") || "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

const CROP_MAP = {
  "paddy(dhan)(common)": "Paddy", "rice": "Paddy", "paddy": "Paddy",
  "cotton": "Cotton", "cotton(long staple)": "Cotton",
  "chillies(dry)": "Chilli", "chilli": "Chilli",
  "turmeric": "Turmeric", "groundnut": "Groundnut",
  "maize": "Maize", "coconut": "Coconut", "mango": "Mango",
  "tomato": "Tomato", "onion": "Onion", "sugarcane": "Sugarcane",
  "cashewnuts": "Cashew", "banana": "Banana",
};

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(DATA_GOV_API);
    url.searchParams.set("api-key", DATA_GOV_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("filters[state.keyword]", "Andhra Pradesh");
    url.searchParams.set("limit", "500");
    url.searchParams.set("sort[arrival_date]", "desc");

    const res = await fetch(url.toString());
    const json = await res.json();
    
    if (!json.records) {
      return new Response(JSON.stringify({ error: "No records from API" }), { status: 500 });
    }

    const prices = json.records
      .filter(r => r.commodity && r.district && r.modal_price)
      .map(r => ({
        crop: CROP_MAP[r.commodity?.toLowerCase()] || r.commodity,
        district: r.district,
        mandi: r.market || r.district,
        price: parseFloat(r.modal_price) || 0,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        price_date: r.arrival_date?.includes("/")
          ? r.arrival_date.split("/").reverse().join("-")
          : r.arrival_date || new Date().toISOString().split("T")[0],
        source: "agmarknet",
      }))
      .filter(r => r.price > 0);

    const { error } = await supabase
      .from("market_prices")
      .upsert(prices, { onConflict: "crop,district,price_date", ignoreDuplicates: true });

    return new Response(
      JSON.stringify({ 
        success: !error, 
        count: prices.length,
        error: error?.message 
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
`;

export default EDGE_FUNCTION_CODE;
