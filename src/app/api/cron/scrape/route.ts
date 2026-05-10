import { NextResponse } from 'next/server';

// Vercel Cron - runs automatically on schedule
// Add in vercel.json: 
// {
//   "crons": [
//     { "path": "/api/cron/scrape", "schedule": "0 * * * *" }
//   ]
// }
// Or use Hermes cron: hermes cron create --schedule "0 * * * *" etc

export async function GET() {
  // Return scraper status
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Scraper cron running',
    schedule: 'hourly',
  });
}