import { NextRequest, NextResponse } from "next/server";
import TOP_RETAILERS from "@/lib/stores";

// Return all stores from the stores.ts file
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  
  let results = TOP_RETAILERS;
  
  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.domain.toLowerCase().includes(q)
    );
  }
  
  // Filter by category
  if (category) {
    results = results.filter(s => s.category === category);
  }
  
  // Assign mock scores for demo (in production these come from scraper)
  const resultsWithScores = results.map((store, index) => ({
    id: store.name.toLowerCase().replace(/\s+/g, "-"),
    name: store.name,
    domain: store.domain,
    category: store.category,
    overall_score: Math.floor(50 + (index % 50)),
    return_score: Math.floor(40 + (index % 55)),
    shipping_score: Math.floor(45 + (index % 50)),
    warranty_score: Math.floor(35 + (index % 60)),
    lifetime_warranty: Math.random() > 0.7 ? 1 : 0,
    price_match: Math.random() > 0.8 ? 1 : 0,
    return_days: [30, 60, 90, 30, 45][index % 5],
    free_shipping_threshold: [0, 35, 50, 75, 99][index % 5],
  }));
  
  // Sort by score
  resultsWithScores.sort((a, b) => b.overall_score - a.overall_score);
  
  // Limit results
  const limit = parseInt(searchParams.get("limit") || "100");
  const limitedResults = resultsWithScores.slice(0, limit);
  
  return NextResponse.json({ 
    results: limitedResults,
    total: resultsWithScores.length 
  });
}