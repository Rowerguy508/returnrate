import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import * as os from "os";
import { scrapeBrand } from "../../../lib/scraper";

const DB_PATH = os.homedir() + "/hermes-data/returnrate.db";

function getDb() {
  return Database(DB_PATH);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { domain } = body;

  if (!domain) {
    return NextResponse.json({ error: "domain required" }, { status: 400 });
  }

  try {
    // Run the scraper
    const result = await scrapeBrand(domain);

    // Save to DB - use simple insert OR update
    const db = getDb();
    
    // Check if exists
    const exists = db.prepare("SELECT 1 FROM brand_scores WHERE brand_name = ?").get(result.brand_name);
    
    if (exists) {
      // Update
      db.prepare(`
        UPDATE brand_scores SET
          domain = ?,
          return_days = ?,
          restock_fee_pct = ?,
          free_shipping_threshold = ?,
          shipping_speed = ?,
          cs_response_time = ?,
          overall_score = ?,
          lifetime_warranty = ?,
          price_match_guarantee = ?,
          last_updated = datetime('now'),
          data_source = 'scraped'
        WHERE brand_name = ?
      `).run(
        result.domain,
        result.return_days,
        result.restock_fee_pct,
        result.free_shipping_threshold,
        result.shipping_speed,
        result.cs_response_time || "unknown",
        result.overall_score,
        result.lifetime_warranty ? 1 : 0,
        result.price_match_guarantee ? 1 : 0,
        result.brand_name
      );
    } else {
      // Insert
      db.prepare(`
        INSERT INTO brand_scores (brand_name, domain, return_days, restock_fee_pct, free_shipping_threshold, shipping_speed, cs_response_time, overall_score, lifetime_warranty, price_match_guarantee, last_updated, data_source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'scraped')
      `).run(
        result.brand_name,
        result.domain,
        result.return_days,
        result.restock_fee_pct,
        result.free_shipping_threshold,
        result.shipping_speed,
        result.cs_response_time || "unknown",
        result.overall_score,
        result.lifetime_warranty ? 1 : 0,
        result.price_match_guarantee ? 1 : 0
      );
    }

    db.close();

    return NextResponse.json({ success: true, brand: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}