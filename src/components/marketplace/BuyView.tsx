import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Search, SlidersHorizontal, Package, MessageCircle, Star, Sparkles, Bot, Loader2,
  Shirt, UtensilsCrossed, Laptop, BookOpen, Ticket, Wind,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Item, Seller, SellerRating } from '@/lib/types';
import { CATEGORIES, CONDITIONS } from '@/lib/types';
import { smartSearch, getRecommendations } from '@/lib/ai';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { StarRating } from '@/components/ui/StarRating';
import { SellerReviewForm } from '@/components/marketplace/SellerReviewForm';

const CATEGORY_ICONS: Record<string, typeof Shirt> = {
  clothes: Shirt, food: UtensilsCrossed, electronics: Laptop,
  books_notes: BookOpen, event_tickets: Ticket, appliances: Wind, other: Package,
};

const inputCls = 'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-shadow';
const selectCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400';

export function BuyView() {
  const [items, setItems] = useState<(Item & { seller?: Seller })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [smartMode, setSmartMode] = useState(false);
  const [smartResults, setSmartResults] = useState<string[]>([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<(Item & { seller?: Seller }) | null>(null);

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('items').select('*, seller:sellers(*)').eq('status', 'available').order('created_at', { ascending: false });
    setLoading(false);
    if (!error && data) setItems(data as (Item & { seller?: Seller })[]);
  }

  const doSmartSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSmartResults([]); return; }
    setSmartLoading(true);
    try {
      const results = await smartSearch(query);
      setSmartResults(results.map((r) => r.id));
    } catch {
      setSmartResults([]);
    }
    setSmartLoading(false);
  }, []);

  useEffect(() => {
    if (smartMode && search.trim()) {
      const timer = setTimeout(() => doSmartSearch(search), 400);
      return () => clearTimeout(timer);
    } else {
      setSmartResults([]);
    }
  }, [smartMode, search, doSmartSearch]);

  const filtered = useMemo(() => {
    let result: (Item & { seller?: Seller })[];

    if (smartMode && search.trim()) {
      // Smart search: use AI-ranked results, fall back to all items if no results yet
      const idSet = new Set(smartResults);
      result = smartResults.length > 0
        ? items.filter((item) => idSet.has(item.id))
            .sort((a, b) => smartResults.indexOf(a.id) - smartResults.indexOf(b.id))
        : [];
    } else {
      result = items.filter((item) => {
        if (search) {
          const q = search.toLowerCase();
          if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    }

    // Apply filters on top
    result = result.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (condition !== 'all' && item.condition !== condition) return false;
      if (maxPrice !== null && item.price > maxPrice) return false;
      return true;
    });

    if (!smartMode) {
      if (sortBy === 'price_low') result = [...result].sort((a, b) => a.price - b.price);
      if (sortBy === 'price_high') result = [...result].sort((a, b) => b.price - a.price);
      if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [items, search, smartMode, smartResults, category, condition, maxPrice, sortBy]);

  const activeFilterCount = (category !== 'all' ? 1 : 0) + (condition !== 'all' ? 1 : 0) + (maxPrice !== null ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Campus Marketplace</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Everything from calculators to momos. No middlemen, just students.</p>
      </div>

      <div className="flex gap-3 mb-3">
        <div className="relative flex-1">
          <Search size={20} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${smartMode ? 'text-sky-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={smartMode ? "Smart search: 'black calculator', 'engineering notes'..." : "Search for notes, air coolers, tickets..."}
            className={smartMode ? `${inputCls} border-sky-300 dark:border-sky-500/40 ring-1 ring-sky-300 dark:ring-sky-500/30` : inputCls}
          />
          {smartLoading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-sky-500" />}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
            showFilters || activeFilterCount > 0
              ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal size={18} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-sky-500 text-white">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Smart search toggle */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setSmartMode(!smartMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
            smartMode
              ? 'bg-sky-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Bot size={14} />
          Smart Search {smartMode ? 'ON' : 'OFF'}
        </button>
        {smartMode && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Searches by meaning, not just keywords — try "black calculator" to find Casio FX-991EX
          </span>
        )}
      </div>

      {showFilters && (
        <div className="mb-6 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={() => { setCategory('all'); setCondition('all'); setMaxPrice(null); }} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium">Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectCls}>
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Condition</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectCls}>
                <option value="all">All conditions</option>
                {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Max Price {maxPrice !== null && <span className="text-sky-600 dark:text-sky-400">₹{maxPrice}</span>}</label>
              <input type="range" min={0} max={5000} step={50} value={maxPrice ?? 5000} onChange={(e) => setMaxPrice(Number(e.target.value) >= 5000 ? null : Number(e.target.value))} className="w-full accent-sky-500" />
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1"><span>₹0</span><span>₹5000+</span></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading || smartLoading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
        </p>
        {!smartMode && (
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="newest">Newest first</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching the good stuff..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Package size={28} />} title="No items found" subtitle={smartMode ? "Smart search couldn't find a match. Try different words or turn off Smart Search." : "Try adjusting your filters or search. Maybe someone's about to post exactly what you need."} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => {
            const Icon = CATEGORY_ICONS[item.category] || Package;
            const cond = CONDITIONS.find((c) => c.value === item.condition);
            return (
              <button key={item.id} onClick={() => setSelectedItem(item)} className="group text-left bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-500/30 transition-all hover:scale-[1.02]">
                <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Icon size={48} /></div>
                  )}
                  {cond && <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-${cond.color}-100 text-${cond.color}-700`}>{cond.label}</span>}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-slate-900 dark:text-white">₹{item.price}</span>
                    {item.seller && <span className="text-xs text-slate-400 dark:text-slate-500">by {item.seller.name}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedItem && <ItemDetailModal item={selectedItem} allItems={items} onClose={() => setSelectedItem(null)} onSelectItem={(it) => setSelectedItem(it)} />}
    </div>
  );
}

function ItemDetailModal({ item, allItems, onClose, onSelectItem }: { item: Item & { seller?: Seller }; allItems: (Item & { seller?: Seller })[]; onClose: () => void; onSelectItem: (item: Item & { seller?: Seller }) => void }) {
  const [ratings, setRatings] = useState<SellerRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [recommendations, setRecommendations] = useState<(Item & { seller?: Seller })[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const Icon = CATEGORY_ICONS[item.category] || Package;
  const cond = CONDITIONS.find((c) => c.value === item.condition);
  const cat = CATEGORIES.find((c) => c.value === item.category);

  useEffect(() => {
    if (item.seller_id) fetchRatings();
    fetchRecommendations();
  }, [item.id, item.seller_id]);

  async function fetchRatings() {
    setLoadingRatings(true);
    const { data } = await supabase.from('seller_ratings').select('*').eq('seller_id', item.seller_id).order('created_at', { ascending: false });
    setLoadingRatings(false);
    if (data) setRatings(data as SellerRating[]);
  }

  async function fetchRecommendations() {
    setLoadingRecs(true);
    try {
      const recs = await getRecommendations(item.id);
      const recIds = new Set(recs.map((r) => r.id));
      const matched = allItems.filter((i) => recIds.has(i.id));
      // Sort by recommendation score order
      matched.sort((a, b) => recs.findIndex((r) => r.id === a.id) - recs.findIndex((r) => r.id === b.id));
      setRecommendations(matched);
    } catch {
      setRecommendations([]);
    }
    setLoadingRecs(false);
  }

  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.ease_rating + r.bargaining_rating + r.quality_rating + r.honesty_rating + r.item_quality_rating) / 5, 0) / ratings.length : 0;
  const waLink = item.seller?.whatsapp ? `https://wa.me/${item.seller.whatsapp.replace(/[^0-9]/g, '')}` : '#';

  return (
    <Modal open={true} onClose={onClose} title="Item Details" maxWidth="max-w-2xl">
      <div className="space-y-5">
        <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 h-56">
          {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Icon size={64} /></div>}
        </div>
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{item.title}</h2>
            <span className="text-2xl font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">₹{item.price}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {cat && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{cat.label}</span>}
            {cond && <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-${cond.color}-100 text-${cond.color}-700`}>{cond.label}</span>}
          </div>
          <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">{item.description}</p>
        </div>
        {item.seller && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Seller Details</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.seller.name}</p>
                {ratings.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={avgRating} readOnly size={14} />
                    <span className="text-sm text-slate-500 dark:text-slate-400">{avgRating.toFixed(1)} ({ratings.length} review{ratings.length !== 1 ? 's' : ''})</span>
                  </div>
                )}
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        {!loadingRecs && recommendations.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/5 border border-sky-200 dark:border-sky-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-sky-500" />
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">You may also like</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendations.map((rec) => {
                const RecIcon = CATEGORY_ICONS[rec.category] || Package;
                return (
                  <button key={rec.id} onClick={() => onSelectItem(rec)} className="text-left group">
                    <div className="h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-1.5">
                      {rec.image_url ? <img src={rec.image_url} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><RecIcon size={24} /></div>}
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-1">{rec.title}</p>
                    <p className="text-xs font-bold text-sky-600 dark:text-sky-400">₹{rec.price}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Seller Reviews</h4>
            {!showReviewForm && <button onClick={() => setShowReviewForm(true)} className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 font-medium">Rate this seller</button>}
          </div>
          {showReviewForm && <SellerReviewForm sellerId={item.seller_id} sellerName={item.seller?.name || 'this seller'} onSubmitted={() => { setShowReviewForm(false); fetchRatings(); }} onCancel={() => setShowReviewForm(false)} />}
          {loadingRatings ? <p className="text-sm text-slate-400 dark:text-slate-500">Loading reviews...</p>
          : ratings.length === 0 ? <p className="text-sm text-slate-400 dark:text-slate-500">No reviews yet. Be the first to rate this seller!</p>
          : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {ratings.map((r) => {
                const overall = (r.ease_rating + r.bargaining_rating + r.quality_rating + r.honesty_rating + r.item_quality_rating) / 5;
                return (
                  <div key={r.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{r.reviewer_name}</span>
                      <StarRating value={overall} readOnly size={12} />
                    </div>
                    {r.comment && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{r.comment}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
