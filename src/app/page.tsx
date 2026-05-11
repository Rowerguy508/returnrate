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
      <div className={`relative w-full aspect-[63/88] min-h-[320px] bg-[#1a1a1e] rounded-[18px] overflow-hidden shadow-2xl transform transition-all duration-300 group-hover:scale-105 ${isHolo ? 'holo-card' : ''}`}>
        
        {/* === FULL HOLOGRAPHIC FOIL BACKGROUND - ONLY Legendary/Rare === */}
        {isHolo && (
          <div className="absolute inset-0" style={{
            background: `linear-gradient(135deg, ${brandColors.colors[0]}20 0%, ${brandColors.colors[1]}15 25%, ${brandColors.colors[2]}20 50%, ${brandColors.colors[1]}15 75%, ${brandColors.colors[0]}20 100%)`,
          }} />
        )}
        
        {/* Shimmer overlay - ONLY Legendary/Rare */}
        {isHolo && <div className="absolute inset-0 holo-shimmer-bg z-[5]" />}
        {isHolo && <div className="absolute inset-0 holo-glitter-full z-[6]" />}
        
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
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[18px] holo-chroma holo-glitter z-[15] pointer-events-none" />
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
          // Generate brand logo - canvas-based with initials in brand colors
const generateLogo = (name: string, colors: string[]) => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;
  
  // Background with brand gradient
  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, colors[0] || '#1e40af');
  gradient.addColorStop(1, colors[1] || '#3b82f6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);
  
  // White circle in center
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(100, 100, 80, 0, Math.PI * 2);
  ctx.fill();
  
  // Brand initials
  const initials = name.split(' ').map(w => w[0]).join('').substring(0,2).toUpperCase();
  ctx.fillStyle = colors[0] || '#1e40af';
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, 100, 100);
  
  return canvas.toDataURL();
};

// Get brand colors for a store
const getBrandData = (store: any) => {
  const colors: Record<string, string[]> = {
    amazon: ['#FF9900', '#FFB84D'],
    bestbuy: ['#0046BE', '#0046BE'],
    target: ['#CC0000', '#CC0000'],
    walmart: ['#0071CE', '#0071CE'],
    costco: ['#005DAA', '#005DAA'],
    nordstrom: ['#C41E3A', '#C41E3A'],
    rei: ['#00855A', '#00855A'],
    zappos: ['#00A0EC', '#00A0EC'],
    chewy: ['#78350F', '#92400E'],
    petco: ['#0d9488', '#0d9488'],
    homedepot: ['#F97316', '#FB923C'],
    lowes: ['#0EA5E9', '#0EA5E9'],
    // Default blue for unknown
    default: ['#2563eb', '#3b82f6'],
  };
  const key = store.name.toLowerCase().replace(/[^a-z]/g, '');
  return colors[key] || colors.default;
};

          const mapped = data.results.map((b: any) => {
            const brandColors = getBrandData(b);
            return {
              name: b.name,
              logo: generateLogo(b.name.replace(/[^a-zA-Z]/g, ''), brandColors),
              score: b.overall_score,
            returnDays: b.return_days,
freeShippingThreshold: b.free_shipping_threshold,
            };
          });
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

      {/* Expanded Card Modal */}
      {selectedBrand && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedBrand(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          {/* Large Card */}
          <div 
            className="relative max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <TCGCard 
              brand={selectedBrand.name}
              logo={selectedBrand.logo}
              score={selectedBrand.score}
              returnDays={selectedBrand.returnDays}
              freeShippingThreshold={selectedBrand.freeShippingThreshold}
              rank={0}
              onClick={() => setSelectedBrand(null)}
            />
            
            {/* Close button */}
            <button
              onClick={() => setSelectedBrand(null)}
              className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
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