import { NextRequest, NextResponse } from "next/server";
import Database from "better-sqlite3";
import * as os from "os";

const DB_PATH = os.homedir() + "/hermes-data/returnrate.db";

function getDb() {
  return Database(DB_PATH);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  
  try {
    const db = getDb();
    let results;
    
    if (query) {
      const stmt = db.prepare("SELECT * FROM brand_scores WHERE brand_name LIKE ? ORDER BY overall_score DESC LIMIT 20");
      results = stmt.all(`%${query}%`);
      
      // Log search
      const logStmt = db.prepare("INSERT INTO search_log (query, results_count) VALUES (?, ?)");
      logStmt.run(query, results.length);
    } else {
      const stmt = db.prepare("SELECT * FROM brand_scores ORDER BY overall_score DESC LIMIT 20");
      results = stmt.all();
    }
    
    db.close();
    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
