const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-insights`;
const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export interface PricePrediction {
  low: number;
  high: number;
  average: number;
  confidence: string;
  similarCount: number;
}

export interface SearchResult {
  id: string;
  score: number;
}

export interface RecommendationResult {
  id: string;
  score: number;
}

async function callEdgeFunction(body: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`AI request failed (${response.status})`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
}

export async function predictPrice(input: {
  title: string;
  description: string;
  category: string;
  condition: string;
}): Promise<PricePrediction> {
  return (await callEdgeFunction({ action: 'predict-price', ...input })) as PricePrediction;
}

export async function smartSearch(query: string): Promise<SearchResult[]> {
  const data = (await callEdgeFunction({ action: 'smart-search', query })) as { results: SearchResult[] };
  return data.results;
}

export async function getRecommendations(itemId: string): Promise<RecommendationResult[]> {
  const data = (await callEdgeFunction({ action: 'recommend', itemId })) as { results: RecommendationResult[] };
  return data.results;
}
