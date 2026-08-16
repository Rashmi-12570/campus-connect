import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

// --- Text similarity helpers ---

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t.length > 1);
}

// Brand/model synonym map for smart search
const SYNONYMS: Record<string, string[]> = {
  casio: ["calculator", "fx", "scientific"],
  calculator: ["casio", "fx", "scientific", "991", "82"],
  laptop: ["computer", "notebook", "pc", "dell", "hp", "lenovo", "macbook"],
  phone: ["mobile", "smartphone", "iphone", "android", "samsung", "oneplus"],
  earphones: ["earbuds", "headphones", "airpods", "pods", "boat", "jbl"],
  book: ["textbook", "notes", "guide", "reference"],
  notes: ["book", "textbook", "material", " handwritten", "study"],
  cooler: ["ac", "air", "fan", "cooling"],
  clothes: ["shirt", "tshirt", "t-shirt", "jeans", "jacket", "hoodie", "kurta"],
  food: ["snack", "snacks", "maggi", "noodles", "biscuit"],
  ticket: ["pass", "entry", "event", "concert", "fest"],
  cycle: ["bicycle", "bike"],
  lab: ["labcoat", "coat", "apron", "experiment"],
  draft: ["drawing", "engineering", "graphics", "sheet"],
};

function expandQuery(query: string): string[] {
  const tokens = tokenize(query);
  const expanded = new Set<string>(tokens);
  for (const token of tokens) {
    const syns = SYNONYMS[token];
    if (syns) syns.forEach((s) => expanded.add(s));
  }
  return [...expanded];
}

function jaccardSimilarity(setA: string[], setB: string[]): number {
  const a = new Set(setA);
  const b = new Set(setB);
  let intersection = 0;
  a.forEach((t) => { if (b.has(t)) intersection++; });
  const union = a.length + b.length - intersection;
  return union === 0 ? 0 : intersection / union;
}

// --- Price prediction ---

const CONDITION_MULTIPLIERS: Record<string, number> = {
  new: 1.0,
  like_new: 0.8,
  used: 0.6,
  old: 0.4,
};

function predictPrice(
  allItems: { title: string; description: string; price: number; category: string; condition: string }[],
  input: { title: string; description: string; category: string; condition: string }
): { low: number; high: number; average: number; confidence: string; similarCount: number } {
  const inputTokens = tokenize(input.title + " " + input.description);
  const inputCat = input.category;

  // Find similar items in same category
  const sameCategory = allItems.filter((i) => i.category === inputCat);

  // Score each item by text similarity
  const scored = sameCategory.map((item) => {
    const itemTokens = tokenize(item.title + " " + item.description);
    const sim = jaccardSimilarity(inputTokens, itemTokens);
    return { ...item, sim };
  });

  // Take items with some similarity
  const similar = scored.filter((s) => s.sim > 0).sort((a, b) => b.sim - a.sim).slice(0, 10);

  if (similar.length === 0) {
    // No similar items — use category averages
    if (sameCategory.length > 0) {
      const prices = sameCategory.map((i) => i.price);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const stdDev = Math.sqrt(prices.reduce((sum, p) => sum + (p - avg) ** 2, 0) / prices.length);
      const conditionMult = CONDITION_MULTIPLIERS[input.condition] ?? 0.6;
      const adjusted = avg * conditionMult;
      return {
        low: Math.round(Math.max(0, adjusted - stdDev) / 10) * 10,
        high: Math.round((adjusted + stdDev) / 10) * 10,
        average: Math.round(adjusted / 10) * 10,
        confidence: "low",
        similarCount: sameCategory.length,
      };
    }
    // No data at all — return a generic estimate
    const baseEstimates: Record<string, number> = {
      clothes: 300, food: 50, electronics: 800, books_notes: 200,
      event_tickets: 500, appliances: 600, other: 250,
    };
    const base = baseEstimates[inputCat] ?? 250;
    const conditionMult = CONDITION_MULTIPLIERS[input.condition] ?? 0.6;
    const adjusted = base * conditionMult;
    return {
      low: Math.round(adjusted * 0.7 / 10) * 10,
      high: Math.round(adjusted * 1.3 / 10) * 10,
      average: Math.round(adjusted / 10) * 10,
      confidence: "low",
      similarCount: 0,
    };
  }

  // Weighted average by similarity score
  const totalWeight = similar.reduce((sum, s) => sum + s.sim, 0);
  const weightedAvg = similar.reduce((sum, s) => sum + s.price * s.sim, 0) / totalWeight;

  // Adjust for condition
  const inputConditionMult = CONDITION_MULTIPLIERS[input.condition] ?? 0.6;
  const avgConditionMult = similar.reduce((sum, s) => sum + (CONDITION_MULTIPLIERS[s.condition] ?? 0.6) * s.sim, 0) / totalWeight;
  const conditionAdjusted = weightedAvg * (inputConditionMult / avgConditionMult);

  const prices = similar.map((s) => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const confidence = similar.length >= 5 ? "high" : similar.length >= 2 ? "medium" : "low";

  return {
    low: Math.round(Math.max(0, Math.min(conditionAdjusted * 0.85, minPrice)) / 10) * 10,
    high: Math.round(Math.max(conditionAdjusted * 1.15, maxPrice) / 10) * 10,
    average: Math.round(conditionAdjusted / 10) * 10,
    confidence,
    similarCount: similar.length,
  };
}

// --- Smart search ---

function smartSearch(
  allItems: { id: string; title: string; description: string; category: string }[],
  query: string
): { id: string; score: number }[] {
  if (!query.trim()) return [];
  const expandedTokens = expandQuery(query);

  const scored = allItems.map((item) => {
    const itemTokens = tokenize(item.title + " " + item.description);
    const sim = jaccardSimilarity(expandedTokens, itemTokens);

    // Boost: if any expanded token is an exact substring of title
    let boost = 0;
    const titleLower = item.title.toLowerCase();
    for (const token of expandedTokens) {
      if (titleLower.includes(token)) boost += 0.1;
    }

    return { id: item.id, score: sim + boost };
  });

  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 50);
}

// --- Recommendations ---

function recommend(
  allItems: { id: string; title: string; description: string; category: string; price: number }[],
  itemId: string
): { id: string; score: number }[] {
  const target = allItems.find((i) => i.id === itemId);
  if (!target) return [];

  const targetTokens = tokenize(target.title + " " + target.description);

  const scored = allItems
    .filter((i) => i.id !== itemId)
    .map((item) => {
      const itemTokens = tokenize(item.title + " " + item.description);
      const textSim = jaccardSimilarity(targetTokens, itemTokens);
      const sameCat = item.category === target.category ? 0.15 : 0;
      const priceProximity = 1 - Math.min(1, Math.abs(item.price - target.price) / Math.max(target.price, 1));
      const score = textSim * 0.5 + sameCat + priceProximity * 0.2;
      return { id: item.id, score };
    });

  return scored.filter((s) => s.score > 0.05).sort((a, b) => b.score - a.score).slice(0, 4);
}

// --- Main handler ---

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;

    // Fetch all available items for analysis
    const { data: allItems, error: fetchError } = await supabase
      .from("items")
      .select("id, title, description, price, category, condition, status")
      .eq("status", "available");

    if (fetchError) throw new Error(fetchError.message);

    const items = allItems || [];

    if (action === "predict-price") {
      const { title, description, category, condition } = body;
      if (!title || !category || !condition) {
        return new Response(JSON.stringify({ error: "Missing required fields: title, category, condition" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = predictPrice(items, { title, description: description || "", category, condition });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "smart-search") {
      const { query } = body;
      if (!query) {
        return new Response(JSON.stringify({ results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results = smartSearch(items, query);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "recommend") {
      const { itemId } = body;
      if (!itemId) {
        return new Response(JSON.stringify({ error: "Missing required field: itemId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const results = recommend(items, itemId);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: predict-price, smart-search, or recommend" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
