import sqlite3
from datetime import datetime
import os

DB_PATH = os.path.expanduser("~/hermes-data/returnrate.db")

def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    
    # Brand scores table
    c.execute('''CREATE TABLE IF NOT EXISTS brand_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand_name TEXT NOT NULL UNIQUE,
        domain TEXT NOT NULL,
        return_days INTEGER DEFAULT 30,
        restock_fee_pct INTEGER DEFAULT 0,
        free_shipping_threshold REAL DEFAULT 0,
        shipping_speed TEXT DEFAULT 'standard',
        cs_response_time TEXT DEFAULT 'unknown',
        overall_score REAL DEFAULT 50,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_source TEXT DEFAULT 'scraped',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    # Search history
    c.execute('''CREATE TABLE IF NOT EXISTS search_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        results_count INTEGER DEFAULT 0,
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    
    conn.commit()
    conn.close()
    print(f"DB ready: {DB_PATH}")
    return DB_PATH

def add_brand(brand_name, domain, return_days=30, restock_fee_pct=0, free_shipping_threshold=0, shipping_speed='standard', overall_score=None):
    """Add or update a brand"""
    if overall_score is None:
        overall_score = calculate_score(return_days, restock_fee_pct, free_shipping_threshold)
    
    conn = get_db()
    c = conn.cursor()
    c.execute('''INSERT INTO brand_scores 
        (brand_name, domain, return_days, restock_fee_pct, free_shipping_threshold, shipping_speed, overall_score, last_updated)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(brand_name) DO UPDATE SET
            return_days = excluded.return_days,
            restock_fee_pct = excluded.restock_fee_pct,
            free_shipping_threshold = excluded.free_shipping_threshold,
            shipping_speed = excluded.shipping_speed,
            overall_score = excluded.overall_score,
            last_updated = CURRENT_TIMESTAMP''',
        (brand_name, domain, return_days, restock_fee_pct, free_shipping_threshold, shipping_speed, overall_score))
    conn.commit()
    conn.close()

def get_brand(brand_name):
    """Get a brand by name"""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM brand_scores WHERE brand_name = ?", (brand_name,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def search_brands(query):
    """Search brands"""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM brand_scores WHERE brand_name LIKE ? ORDER BY overall_score DESC", (f"%{query}%",))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_all_brands(limit=100):
    """Get all brands"""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM brand_scores ORDER BY overall_score DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def calculate_score(return_days, restock_fee_pct, free_shipping_threshold):
    """Calculate overall score 0-100"""
    # Return policy: 30+ days = 40 pts, less = proportionally less
    return_score = min(40, return_days * 1.33)
    
    # Restock fee: 0% = 30 pts, 10%+ = 0 pts
    restock_score = max(0, 30 - restock_fee_pct * 3)
    
    # Free shipping: <$50 = 20 pts, >$100 = 0 pts
    shipping_score = max(0, min(20, (100 - free_shipping_threshold) / 2.5))
    
    return round(return_score + restock_score + shipping_score)

def log_search(query, results_count):
    """Log a search"""
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO search_log (query, results_count) VALUES (?, ?)", (query, results_count))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    db_path = init_db()
    
    # Seed some initial brands
    brands = [
        ("Nike", "nike.com", 30, 0, 150, "express", 65),
        ("Amazon", "amazon.com", 30, 0, 25, "next-day", 85),
        ("Best Buy", "bestbuy.com", 15, 0, 35, "express", 70),
        ("Walmart", "walmart.com", 90, 0, 35, "standard", 75),
        ("Target", "target.com", 90, 0, 35, "express", 80),
        ("Apple", "apple.com", 14, 0, 0, "express", 55),
        ("Nordstrom", "nordstrom.com", 30, 0, 0, "express", 72),
        ("Adidas", "adidas.com", 30, 0, 100, "standard", 58),
        ("Zappos", "zappos.com", 30, 0, 0, "express", 78),
        ("Costco", "costco.com", 90, 0, 0, "store", 82),
        ("Home Depot", "homedepot.com", 30, 0, 0, "standard", 70),
        ("Lowes", "lowes.com", 30, 0, 0, "standard", 68),
        ("Macys", "macys.com", 60, 0, 99, "standard", 65),
        ("Nordstrom Rack", "nordstromrack.com", 30, 0, 0, "express", 70),
        ("REI", "rei.com", 30, 0, 50, "express", 75),
    ]
    
    for b in brands:
        add_brand(*b)
    
    print(f"Seeded {len(brands)} brands")
    print(f"DB: {db_path}")