"use client";

import { useState, useEffect } from "react";
import { Search, RotateCcw, Star, Zap, Shield, Truck, Award } from "lucide-react";

// Card Rarity determines foil effect
type Rarity = "common" | "uncommon" | "rare" | "legendary";

function getRarity(score: number): Rarity {
  if (score >= 85) return "legendary";
  if (score >= 75) return "rare";
  if (score >= 65) return "uncommon";
  return "common";
}

function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case "legendary": return "from-amber-400 via-yellow-300 to-amber-500";
    case "rare": return "from-indigo-400 via-purple-400 to-pink-500";
    case "uncommon": return "from-emerald-400 via-teal-400 to-cyan-400";
    default: return "from-slate-400 via-slate-300 to-slate-500";
  }
}

// Brand color schemes matching their logos
function getBrandColors(brandName: string): { gradient: string; colors: string[]; nameGradient: string } {
  switch (brandName.toLowerCase()) {
    case "amazon":
      return { gradient: "from-orange-500 via-amber-400 to-orange-600", colors: ["#FF9900", "#FFB84D", "#FFCC80"], nameGradient: "from-orange-500/30 to-orange-400/10" };
    case "costco":
      return { gradient: "from-blue-600 via-blue-500 to-blue-700", colors: ["#005DAA", "#4285DC", "#8AB4F8"], nameGradient: "from-blue-600/30 to-blue-500/10" };
    case "target":
      return { gradient: "from-red-600 via-red-500 to-red-700", colors: ["#CC0000", "#FF4D4D", "#FF8080"], nameGradient: "from-red-600/30 to-red-500/10" };
    case "zappos":
      return { gradient: "from-sky-600 via-sky-500 to-sky-700", colors: ["#00A0EC", "#4DB8FF", "#80D4FF"], nameGradient: "from-sky-600/30 to-sky-500/10" };
    case "rei":
      return { gradient: "from-green-600 via-green-500 to-green-700", colors: ["#00855A", "#34C759", "#68D896"], nameGradient: "from-green-600/30 to-green-500/10" };
    case "walmart":
      return { gradient: "from-blue-600 via-blue-500 to-blue-700", colors: ["#0071CE", "#4A90D9", "#80B4E0"], nameGradient: "from-blue-600/30 to-blue-500/10" };
    case "best buy":
      return { gradient: "from-blue-600 via-yellow-500 to-blue-700", colors: ["#0046BE", "#FFD700", "#FFEB80"], nameGradient: "from-blue-600/30 to-yellow-500/10" };
    case "nordstrom":
      return { gradient: "from-red-600 via-red-500 to-red-700", colors: ["#C41E3A", "#FF4D6A", "#FF8096"], nameGradient: "from-red-600/30 to-red-500/10" };
    default:
      return { gradient: "from-slate-600 via-slate-500 to-slate-700", colors: ["#64748B", "#94A3B8", "#CBD5E1"], nameGradient: "from-slate-600/30 to-slate-500/10" };
  }
}

// POKEMON-STYLE CARD COMPONENT
function TCGCard({ brand, logo, score, returnDays, freeShippingThreshold, rank, onClick }: { 
  brand: string;
  logo: string;
  score: number;
  returnDays: number;
  freeShippingThreshold: number;
  rank: number;
  onClick?: () => void;
}) {
  const rarity = getRarity(score);
  const gradient = getRarityColor(rarity);
  const brandColors = getBrandColors(brand);
  const isHolo = rarity === "legendary" || rarity === "rare"; // Only legendary + rare get full holo effect
  
  // HP box uses brand colors
  const hpBoxColor = score >= 80 ? brandColors.gradient : score >= 70 ? "from-yellow-500 to-orange-500" : "from-red-600 to-red-700";
  const stars = rarity === "legendary" ? "★★★" : rarity === "rare" ? "★★" : rarity === "uncommon" ? "★" : "☆";
  const setNumber = "RR1";
  const artist = "ReturnRate";

  return (
    <div 
      className="group relative perspective-1000 cursor-pointer"
      style={{ animationDelay: `${rank * 100}ms` }}
      onClick={onClick}
    >
      {/* === POKEMON CARD LAYOUT === */}
      <div className={`relative w-full aspect-[63/88] min-h-[320px] bg-[#1a1a1e] rounded-[18px] overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:scale-105 ${isHolo ? 'holo-foil' : ''}`}>
        
        {/* === FULL HOLOGRAPHIC FOIL BACKGROUND - ONLY Legendary/Rare === */}
        {isHolo && (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${brandColors.colors[0]}20 0%, ${brandColors.colors[1]}15 25%, ${brandColors.colors[2]}20 50%, ${brandColors.colors[1]}15 75%, ${brandColors.colors[0]}20 100%)`,
          }} />
        )}
        
        {/* Shimmer overlay - ONLY Legendary/Rare - ENHANCED GLITTER */}
        {isHolo && (
          <>
            <div className="absolute inset-0 holo-shimmer-bg z-[5]" />
            <div className="absolute inset-0 holo-glitter z-[6]" />
            <div className="absolute inset-0 holo-legendary z-[7]" />
          </>
        )}
        
        {/* === CARD FRAME BORDER === */}
        <div className="absolute inset-0 rounded-[18px] overflow-hidden">
          {/* Inner border - brand color tint */}
          <div className="absolute inset-[3px] border-4 border-white/20 rounded-[15px]" />
          <div className="absolute inset-[4px] border border-white/10 rounded-[14px]" />
        </div>

        {/* === TOP HEADER: Name box + HP box === */}
        <div className="absolute top-0 left-0 right-0 p-[10px] flex justify-between items-start">
          
          {/* Brand Name Box - Brand colored */}
          <div className="relative">
            <div 
              className="relative px-2 py-1 rounded-t-sm border-b-0"
              style={{
                background: `linear-gradient(to bottom, ${brandColors.colors[0]}40, ${brandColors.colors[0]}20)`,
                borderColor: `${brandColors.colors[0]}60`,
              }}
            >
              <span className="text-[11px] font-bold text-white tracking-wide">{brand}</span>
            </div>
            <div className="absolute top-full left-2 right-0 h-1.5" style={{ background: `linear-gradient(to bottom, ${brandColors.colors[0]}40, transparent)` }} />
          </div>

          {/* HP Box - Uses brand colors */}
          <div className="relative">
            <div 
              className={`flex items-center px-2 py-0.5 rounded-sm border border-white/30 shadow-md`}
              style={{ background: `linear-gradient(135deg, ${brandColors.colors[0]}, ${brandColors.colors[1]})` }}
            >
              <span className="text-[10px] font-bold text-white mr-1">HP</span>
              <span className="text-[14px] font-bold text-white">{score}</span>
            </div>
          </div>
        </div>

        {/* === CARD ART AREA === */}
        <div 
          className="absolute top-[38px] left-[10px] right-[10px] bottom-[90px] rounded-lg overflow-hidden border"
          style={{ 
            background: `linear-gradient(to bottom, ${brandColors.colors[0]}30, #0f172a)`,
            borderColor: `${brandColors.colors[0]}50`,
          }}
        >
          {/* White art background */}
          <div className="w-full h-full flex items-center justify-center bg-white">
            <img
              src={logo}
              alt={brand}
              className="object-contain w-20 h-20"
              onError={(e) => {
                // Fallback to Google favicon if brand favicon fails
                (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${brand.toLowerCase()}.com&sz=128`;
              }}
            />
          </div>
          {/* Art frame */}
          <div className="absolute inset-0 border-[3px] border-white/20 rounded-lg pointer-events-none" />
        </div>

        {/* === ATTACKS SECTION === */}
        <div className="absolute bottom-[10px] left-[10px] right-[10px] space-y-1">
          
          {/* Attack 1 */}
          <div className="flex items-start gap-1">
            <div className="flex gap-0.5 shrink-0 mt-0.5">
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ background: `linear-gradient(to bottom right, ${brandColors.colors[0]}, ${brandColors.colors[1]})` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold" style={{ color: brandColors.colors[1] }}>RETURN POLICY</span>
              </div>
              <p className="text-[8px] text-slate-300 leading-tight">{returnDays} days. No restocking fee. Original packaging not required.</p>
            </div>
          </div>

          {/* Attack 2 */}
          <div className="flex items-start gap-1">
            <div className="flex gap-0.5 shrink-0 mt-0.5">
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ background: `linear-gradient(to bottom right, ${brandColors.colors[0]}, ${brandColors.colors[1]})` }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold" style={{ color: brandColors.colors[1] }}>FREE SHIPPING</span>
              </div>
              <p className="text-[8px] text-slate-300 leading-tight">
                {freeShippingThreshold > 0 ? `Orders over $${freeShippingThreshold} ship free` : "Free shipping on all orders"}
              </p>
            </div>
          </div>
        </div>

        {/* === BOTTOM INFO === */}
        <div className="absolute bottom-[2px] left-[10px] right-[10px] flex justify-between items-end">
          <div className="text-[8px]" style={{ color: brandColors.colors[1] }}>{stars}</div>
          <div className="text-[7px] text-slate-500 text-right leading-tight">
            {setNumber} &#183; {(Math.random() * 100 + 1).toFixed(0).padStart(3, '0')}/95<br/>
            {artist}
          </div>
        </div>

        {/* LEGAL */}
        <div className="absolute bottom-[0px] left-0 right-0 text-[5px] text-slate-600 text-center">
          © 2025 ReturnRate TCG • Not affiliated with Pokémon
        </div>

        {/* HOVER: Extra chromatic shimmer - ONLY Legendary/Rare */}
        {isHolo && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[18px] holo-chroma holo-glitter holo-legendary z-[15] pointer-events-none" />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<{name: string; logo: string; score: number; returnDays: number; freeShippingThreshold: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Array<{name: string; logo: string; score: number; returnDays: number; freeShippingThreshold: number}>>([]);

  // Fetch brands from API on mount
  useEffect(() => {
    fetch('/api/brands?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          // Brand logo URLs from Wikimedia (verified working)
const BRAND_LOGOS: Record<string, string> = {
  // Top e-commerce
  'amazon': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  'bestbuy': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Best_Buy_Logo.svg',
  'target': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Target_Corporation_logo.svg',
  'walmart': 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
  'costco': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Costco_Logo.svg',
  'nordstrom': 'https://upload.wikimedia.org/wikipedia/commons/6/61/Nordstrom_logo.svg',
  'rei': 'https://upload.wikimedia.org/wikipedia/commons/c/cc/REI_Co-op_Logo.svg',
  'zappos': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Zappos.com_logo.svg',
  'chewy': 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Chewy_Logo.svg',
  'petco': 'https://upload.wikimedia.org/wikipedia/commons/7/74/Petco_Logo.svg',
  'homedepot': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Home_Depot_logo.svg',
  'lowes': 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Lowe%27s_logo.svg',
  // Apparel
  'nike': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'adidas': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Adidas_Logo.svg',
  'underarmor': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Under_Armour_Logo.svg',
  'finishline': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Finish_Line_Logo.svg',
  'footlocker': 'https://upload.wikimedia.org/wikipedia/commons/1/14/Foot_Locker_Logo.svg',
  'eastbay': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Eastbay_logo.svg',
  'sockclub': 'https://upload.wikimedia.org/wikipedia/commons/d/da/Sock_Club_Logo.svg',
  // Beauty
  'sephora': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Sephora_Logo.svg',
  'ulta': 'https://upload.wikimedia.org/wikipedia/commons/9/95/Ulta_Beauty_Logo.svg',
  '丝芙兰': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Sephora_Logo.svg',
  'credo': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Credo_Beauty_Logo.svg',
  'beauty': 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Sephora_Logo.svg',
  // Tech
  'apple': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Logo.svg',
  'microsoft': 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  'google': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  'samsung': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Samsung_Logo.svg',
  'sony': 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Sony_Logo.svg',
  'dell': 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
  'hp': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/HP_logo.svg',
  'newegg': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Newegg_logo.svg',
  // Home & Furniture
  'ikea': 'https://upload.wikimedia.org/wikipedia/commons/c/c8/IKEA_logo.svg',
  'wayfair': 'https://upload.wikimedia.org/wikipedia/commons/3/36/Wayfair_Logo.svg',
  'bedbath': 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Bed_Bath_%26_Beyond_Logo.svg',
  'williamssonoma': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Williams_Sonoma_Logo.svg',
  'pier1': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Pier_1_Logo.svg',
  'lampsplus': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Lamps_Plus_Logo.svg',
  // Sports & Outdoors
  'cabelas': 'https://upload.wikimedia.org/wikipedia/commons/9/90/Cabela%27s_Logo.svg',
  'basspro': 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Bass_Pro_Shops_Logo.svg',
  'dicks': 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Dicks_Sporting_Goods_Logo.svg',
  'moosejaw': 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Moosejaw_Logo.svg',
  'backcountry': 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Backcountry_Logo.svg',
  // Grocery
  'wholefoods': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Whole_Foods_Market_Logo.svg',
  'trader': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Trader_Joe%27s_Logo.svg',
  'kroger': 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Kroger_Logo.svg',
  'publix': 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Publix_Logo.svg',
  'safeway': 'https://upload.wikimedia.org/wikipedia/commons/7/77/Safeway_Logo.svg',
  'wegmans': 'https://upload.wikimedia.org/wikipedia/commons/3/39/Wegmans_Logo.svg',
  // Fast Retail
  'shein': 'https://upload.wikimedia.org/wikipedia/commons/6/63/Shein_Logo.svg',
  'temus': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Shein_Logo.svg',
  'aliexpress': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Aliexpress_Logo.svg',
  'wish': 'https://upload.wikimedia.org/wikipedia/commons/7/76/Wish_Logo.svg',
  // Office
  'staples': 'https://upload.wikimedia.org/wikipedia/commons/8/84/Staples_Logo.svg',
};

// Get real brand logo - prefer Wikimedia, fallback to Google favicon
const getLogo = (name: string, domain: string) => {
  // Normalize: "Under Armour" -> "underarmor", "Best Buy" -> "bestbuy"
  const key = name.toLowerCase().replace(/[^a-z]/g, '').replace(/armour/g, 'armor'); // fix Under Armour
  if (BRAND_LOGOS[key]) return BRAND_LOGOS[key];
  
  // Try Google favicon (more reliable than brand favicon)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

          const mapped = data.results.map((b: any) => ({
            name: b.name,
            logo: getLogo(b.name, b.domain),
            score: b.overall_score,
            returnDays: b.return_days,
            freeShippingThreshold: b.free_shipping_threshold,
          }));
          setBrands(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredBrands = searchQuery 
    ? brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white overflow-x-hidden">
      {/* Background: Card Table felt texture */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(ellipse at 50% 50%, #1a1a1f 0%, #0d0d0f 70%)`,
          }}
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header - Like a card binder ring */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo as Card Binder Ring */}
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg opacity-80 blur-md" />
              <div className="relative w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-black" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold block">ReturnRate</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Collector's Edition</span>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <a href="/about" className="hover:text-white transition-colors">Dex</a>
            <a href="/submit" className="hover:text-white transition-colors">Submit</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full mb-4">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium uppercase tracking-wider">Limited Edition</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Collect the best brands
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-lg">
            Build your collection. Every brand is a rare find.
          </p>
        </div>

        {/* Search - Like a card scanner */}
        <div className="max-w-xl mx-auto mb-16">
          <form action="/search" method="GET" className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-50" />
            <div className="relative flex items-center bg-slate-900/80 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="pl-5">
                <Search className="w-5 h-5 text-slate-500" />
              </div>
              <input
                type="text"
                name="q"
                placeholder="Scan a brand..."
                className="w-full bg-transparent py-4 px-4 text-white placeholder:text-slate-600 focus:outline-none font-medium"
              />
              <div className="pr-2">
                <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm font-bold text-slate-400">
                  SCAN
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Stats - Card Collection Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white">{brands.length}</div>
            <div className="text-xs text-slate-500 uppercase">Cards Collected</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-amber-400">1</div>
            <div className="text-xs text-slate-500 uppercase">Legendary</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-purple-400">3</div>
            <div className="text-xs text-slate-500 uppercase">Rare</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-emerald-400">78</div>
            <div className="text-xs text-slate-500 uppercase">Avg Score</div>
          </div>
        </div>

        {/* Card Grid - Binder Layout */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Collection</h2>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
                  <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
                  <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
                  <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* The Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredBrands.map((brand, i) => (
              <TCGCard 
                key={brand.name}
                brand={brand.name}
                logo={brand.logo}
                score={brand.score}
                returnDays={brand.returnDays}
                freeShippingThreshold={brand.freeShippingThreshold}
                rank={i}
                onClick={() => setSelectedBrand(brand)}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm mb-4">More brands coming soon...</p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-600">
            <span>© 2025 ReturnRate TCG</span>
            <span>•</span>
            <span>Not affiliated with Pokémon or any IRL TCG</span>
          </div>
        </div>
      </main>

      {/* Expanded Card Modal - POKEMON STYLE with full stats */}
      {selectedBrand && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBrand(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          
          {/* Full Detail Card - With Holographic Effects using real divs */}
          <div 
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Main Card - Super Detailed + REAL HOLOGRAPHIC DIVS */}
            <div className={`relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border-2 shadow-2xl overflow-hidden ${selectedBrand.score >= 95 ? 'holo-border-legendary' : selectedBrand.score >= 90 ? 'holo-border-legendary' : selectedBrand.score >= 80 ? 'holo-border-rare' : 'border-slate-700'}`}>
              
              {/* LAYER 1: Full-card rainbow chroma background (REAL DIV) */}
              {selectedBrand.score >= 80 && (
                <div 
                  className="absolute inset-0 z-[1] pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,0,128,0.35) 0%, rgba(255,154,0,0.35) 15%, rgba(208,252,59,0.3) 30%, rgba(79,252,156,0.3) 45%, rgba(63,188,252,0.35) 60%, rgba(155,88,252,0.35) 75%, rgba(255,0,128,0.35) 100%)',
                    backgroundSize: '400% 400%',
                    animation: 'chroma-shift 3s ease infinite',
                  }}
                />
              )}
              
              {/* LAYER 2: Shimmer sweep (REAL DIV) */}
              {selectedBrand.score >= 80 && (
                <div 
                  className="absolute inset-0 z-[2] pointer-events-none"
                  style={{
                    background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.2) 50%, transparent 60%)',
                    backgroundSize: '300% 300%',
                    animation: 'shimmer-sweep 4s ease-in-out infinite',
                  }}
                />
              )}
              
              {/* LAYER 3: Rainbow wave for legendary (REAL DIV) */}
              {selectedBrand.score >= 90 && (
                <div 
                  className="absolute inset-0 z-[3] pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, transparent 25%, rgba(255,200,100,0.25) 35%, rgba(255,255,255,0.5) 42%, rgba(255,255,255,0.5) 45%, rgba(255,200,100,0.25) 55%, transparent 75%)',
                    backgroundSize: '200% 200%',
                    animation: 'rainbow-wave 2.5s linear infinite',
                  }}
                />
              )}
              
{/* LAYER 4: MEGA GLITTER - Many more sparkles + animated */}
              {selectedBrand.score >= 80 && (
                <>
                  {/* Static sparkles layer */}
                  <div 
                    className="absolute inset-0 z-[4] pointer-events-none"
                    style={{
                      backgroundImage: `
                        radial-gradient(1.2px 1.2px at 5% 8%, white 100%, transparent),
                        radial-gradient(1.8px 1.8px at 12% 22%, #fbbf24 100%, transparent),
                        radial-gradient(1.5px 1.5px at 18% 35%, rgba(255,255,255,0.95) 100%, transparent),
                        radial-gradient(1.3px 1.3px at 25% 15%, #a855f7 100%, transparent),
                        radial-gradient(1.6px 1.6px at 32% 42%, rgba(255,255,255,0.9) 100%, transparent),
                        radial-gradient(1.4px 1.4px at 40% 28%, #06b6d4 100%, transparent),
                        radial-gradient(1.2px 1.2px at 48% 52%, white 100%, transparent),
                        radial-gradient(1.7px 1.7px at 55% 18%, #f472b6 100%, transparent),
                        radial-gradient(1.3px 1.3px at 62% 38%, rgba(255,255,255,0.85) 100%, transparent),
                        radial-gradient(1.5px 1.5px at 70% 25%, #fbbf24 100%, transparent),
                        radial-gradient(1.2px 1.2px at 78% 48%, #a855f7 100%, transparent),
                        radial-gradient(1.6px 1.6px at 85% 12%, rgba(255,255,255,0.9) 100%, transparent),
                        radial-gradient(1.4px 1.4px at 92% 35%, #06b6d4 100%, transparent),
                        radial-gradient(1.3px 1.3px at 8% 58%, white 100%, transparent),
                        radial-gradient(1.5px 1.5px at 15% 72%, #f472b6 100%, transparent),
                        radial-gradient(1.2px 1.2px at 22% 85%, rgba(255,255,255,0.8) 100%, transparent),
                        radial-gradient(1.6px 1.6px at 38% 65%, #fbbf24 100%, transparent),
                        radial-gradient(1.4px 1.4px at 45% 78%, rgba(255,255,255,0.9) 100%, transparent),
                        radial-gradient(1.3px 1.3px at 52% 62%, #a855f7 100%, transparent),
                        radial-gradient(1.5px 1.5px at 65% 55%, white 100%, transparent),
                        radial-gradient(1.2px 1.2px at 72% 72%, #06b6d4 100%, transparent),
                        radial-gradient(1.7px 1.7px at 82% 68%, rgba(255,255,255,0.85) 100%, transparent),
                        radial-gradient(1.3px 1.3px at 88% 82%, #f472b6 100%, transparent),
                        radial-gradient(1.4px 1.4px at 95% 58%, white 100%, transparent)`,
                      backgroundSize: '80px 80px',
                      animation: 'glitter-sparkle 2s ease-in-out infinite',
                    }}
                  />
                  {/* Animated floating sparkles */}
                  <div 
                    className="absolute inset-0 z-[4] pointer-events-none"
                    style={{
                      backgroundImage: `
                        radial-gradient(2px 2px at 20% 20%, white 100%, transparent),
                        radial-gradient(2.5px 2.5px at 50% 50%, rgba(255,255,255,0.9) 100%, transparent),
                        radial-gradient(2px 2px at 80% 30%, #fbbf24 100%, transparent),
                        radial-gradient(2.2px 2.2px at 35% 70%, #a855f7 100%, transparent),
                        radial-gradient(1.8px 1.8px at 65% 80%, rgba(255,255,255,0.85) 100%, transparent)`,
                      backgroundSize: '150px 150px',
                      animation: 'glitter-float 3s ease-in-out infinite',
                    }}
                  />
                  {/* Extra tiny starbursts */}
                  <div 
                    className="absolute inset-0 z-[4] pointer-events-none"
                    style={{
                      backgroundImage: `
                        radial-gradient(0.8px 0.8px at 10% 50%, white 100%, transparent),
                        radial-gradient(1px 1px at 30% 10%, #fbbf24 100%, transparent),
                        radial-gradient(0.8px 0.8px at 50% 90%, rgba(255,255,255,0.9) 100%, transparent),
                        radial-gradient(1px 1px at 70% 60%, #a855f7 100%, transparent),
                        radial-gradient(0.8px 0.8px at 90% 40%, #06b6d4 100%, transparent),
                        radial-gradient(1px 1px at 25% 75%, #f472b6 100%, transparent),
                        radial-gradient(0.8px 0.8px at 75% 25%, white 100%, transparent),
                        radial-gradient(1px 1px at 60% 40%, #fbbf24 100%, transparent)`,
                      backgroundSize: '60px 60px',
                      animation: 'glitter-twinkle 1.5s ease-in-out infinite',
                    }}
                  />
                </>
              )}
              
              {/* Card Content - above the holographic layers */}
              <div className="relative z-10">
              {/* Header - Brand Name + HP */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white drop-shadow-lg">{selectedBrand.name}</h2>
                  <p className="text-slate-300 text-sm drop-shadow-md">Elite Retailer Collection</p>
                </div>
                <div className="text-right">
                  <div className={`inline-block px-4 py-1 rounded-full ${selectedBrand.score >= 90 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : selectedBrand.score >= 80 ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gradient-to-r from-slate-600 to-slate-500'}`}>
                    <span className="text-3xl font-black text-white">{selectedBrand.score}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">RETURN RATING</p>
                </div>
              </div>

              {/* Large Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-white rounded-xl p-4 flex items-center justify-center">
                  <img 
                    src={selectedBrand.logo} 
                    alt={selectedBrand.name}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${selectedBrand.name.toLowerCase()}&sz=128`;
                    }}
                  />
                </div>
              </div>

              {/* STATS PANEL - Like Pokemon Trainer Card */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
                <h3 className="text-slate-400 text-xs font-bold mb-3 border-b border-slate-700 pb-2">STATS</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Return Window</span>
                    <span className="text-white font-bold">{selectedBrand.returnDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Free Shipping</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedBrand.freeShippingThreshold > 0 ? `$${selectedBrand.freeShippingThreshold}+` : 'Always'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Rarity</span>
                    <span className={`font-bold ${selectedBrand.score >= 90 ? 'text-amber-400' : selectedBrand.score >= 80 ? 'text-purple-400' : 'text-slate-400'}`}>
                      {selectedBrand.score >= 95 ? 'LEGENDARY ★★★' : selectedBrand.score >= 90 ? 'GOLDEN ★★' : selectedBrand.score >= 80 ? 'RARE ★★' : selectedBrand.score >= 70 ? 'UNCOMMON ★' : 'COMMON'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 text-sm">Holo Effect</span>
                    <span className="text-cyan-400 font-bold">{selectedBrand.score >= 80 ? 'ACTIVE' : 'NONE'}</span>
                  </div>
                </div>
              </div>

              {/* ATTACKS - Like Pokemon Moves */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700">
                <h3 className="text-slate-400 text-xs font-bold mb-3 border-b border-slate-700 pb-2">POLICIES</h3>
                
                {/* Policy 1 */}
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <span className="text-2xl">↩</span>
                  </div>
                  <div>
                    <h4 className="text-emerald-400 font-bold text-sm">EASY RETURNS</h4>
                    <p className="text-slate-400 text-sm">{selectedBrand.returnDays}-day return window. No restocking fees. Original packaging preferred but not required.</p>
                  </div>
                </div>
                
                {/* Policy 2 */}
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-bold text-sm">FREE SHIPPING</h4>
                    <p className="text-slate-400 text-sm">
                      {selectedBrand.freeShippingThreshold > 0 
                        ? `Free shipping on orders over $${selectedBrand.freeShippingThreshold}` 
                        : 'Free shipping on all orders, always.'}
                    </p>
                  </div>
                </div>
                
                {/* Policy 3 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold text-sm">PRICE MATCH</h4>
                    <p className="text-slate-400 text-sm">Price match guarantee available. Contact support within 30 days.</p>
                  </div>
                </div>
              </div>

              {/* WEAKNESS/RESISTANCE - Pokemon style */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-800/30 rounded-lg p-3 border border-red-900/30">
                  <h4 className="text-red-400 text-xs font-bold mb-1">WEAKNESS</h4>
                  <p className="text-slate-500 text-sm">Final sale items not returnable</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-3 border border-blue-900/30">
                  <h4 className="text-blue-400 text-xs font-bold mb-1">RESISTANCE</h4>
                  <p className="text-slate-500 text-sm">Defective items always accepted</p>
                </div>
              </div>

              {/* RETREAT COST + FLOOR COST */}
              <div className="flex justify-between items-center bg-slate-800/30 rounded-lg p-3 border border-slate-700 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">RETREAT COST</span>
                  <div className="flex gap-1">
                    <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center">0</span>
                  </div>
                </div>
                <div className="text-slate-500 text-xs">
                  RR1 &#183; 001/95 &#183; ReturnRate
                </div>
              </div>

              {/* POKEDEX INFO */}
              <div className="bg-slate-800/20 rounded-lg p-3 border border-slate-700 text-xs">
                <h4 className="text-slate-400 font-bold mb-1">POKÉDEX INFO</h4>
                <p className="text-slate-500">
                  {selectedBrand.name} is an Elite Retailer species found in the ReturnRate ecosystem. 
                  This card was discovered in 2025 and is rated {selectedBrand.score}/95 for return policy quality.
                  {selectedBrand.score >= 90 && ' Highly sought after by collectors!'}
                </p>
              </div>
              
              </div>{/* End relative z-10 wrapper */}
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx>{`
        @keyframes holo-shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-3 {
          transform: rotateY(3deg);
        }
      `}</style>
    </div>
  );
}