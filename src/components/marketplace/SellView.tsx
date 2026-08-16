import { useEffect, useState } from 'react';
import {
  Package, Plus, Loader2, Check, Trash2, Star, ShoppingBag,
  TrendingUp, PackageCheck, UserCircle, Sparkles, Wand2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Item, Seller, SellerRating } from '@/lib/types';
import { CATEGORIES, CONDITIONS } from '@/lib/types';
import { ensureSeller, getSellerInfo } from '@/lib/seller';
import { predictPrice, type PricePrediction } from '@/lib/ai';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { StarRating } from '@/components/ui/StarRating';
import { Modal } from '@/components/ui/Modal';

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export function SellView() {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [ratings, setRatings] = useState<SellerRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => { init(); }, []);

  async function init() {
    const info = getSellerInfo();
    if (info) {
      try {
        const s = await ensureSeller(info.name, info.whatsapp);
        setSeller(s);
        await fetchSellerData(s.id);
      } catch { setShowSetup(true); }
    } else { setShowSetup(true); }
    setLoading(false);
  }

  async function fetchSellerData(sellerId: string) {
    const [{ data: itemData }, { data: ratingData }] = await Promise.all([
      supabase.from('items').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
      supabase.from('seller_ratings').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
    ]);
    if (itemData) setItems(itemData as Item[]);
    if (ratingData) setRatings(ratingData as SellerRating[]);
  }

  const avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.ease_rating + r.bargaining_rating + r.quality_rating + r.honesty_rating + r.item_quality_rating) / 5, 0) / ratings.length : 0;
  const soldCount = items.filter((i) => i.status === 'sold').length;

  if (loading) return <LoadingSpinner label="Setting up your dashboard..." />;

  if (showSetup || !seller) {
    return <SellerSetup onCreated={async (s) => { setSeller(s); setShowSetup(false); await fetchSellerData(s.id); }} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <UserCircle size={26} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{seller.name}'s Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your listings and check your rep</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Package} label="Total Items" value={items.length} color="sky" />
        <StatCard icon={PackageCheck} label="Sold" value={soldCount} color="emerald" />
        <StatCard icon={Star} label="Rating" value={ratings.length > 0 ? `${avgRating.toFixed(1)}★` : 'N/A'} color="amber" />
        <StatCard icon={TrendingUp} label="Reviews" value={ratings.length} color="violet" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Your Listings</h2>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Package size={28} />} title="No listings yet" subtitle="Time to declark your wardrobe and make some cash. Click 'Add Item' to get started." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <SellerItemCard key={item.id} item={item}
              onMarkSold={async () => { await supabase.from('items').update({ status: 'sold' }).eq('id', item.id); setItems(items.map((i) => (i.id === item.id ? { ...i, status: 'sold' } : i))); }}
              onDelete={async () => { await supabase.from('items').delete().eq('id', item.id); setItems(items.filter((i) => i.id !== item.id)); }}
            />
          ))}
        </div>
      )}

      {ratings.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-4">Reviews About You</h2>
          <div className="space-y-3">
            {ratings.map((r) => {
              const overall = (r.ease_rating + r.bargaining_rating + r.quality_rating + r.honesty_rating + r.item_quality_rating) / 5;
              return (
                <div key={r.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{r.reviewer_name}</span>
                    <StarRating value={overall} readOnly size={14} />
                  </div>
                  {r.comment && <p className="text-sm text-slate-500 dark:text-slate-400">{r.comment}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm && <AddItemForm sellerId={seller.id} onAdded={async () => { setShowForm(false); await fetchSellerData(seller.id); }} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Star; label: string; value: string | number; color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-500/15 flex items-center justify-center text-${color}-500 dark:text-${color}-400 mb-2`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{label}</p>
    </div>
  );
}

function SellerItemCard({ item, onMarkSold, onDelete }: { item: Item; onMarkSold: () => void; onDelete: () => void }) {
  const cond = CONDITIONS.find((c) => c.value === item.condition);
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="relative h-36 bg-slate-100 dark:bg-slate-800">
        {item.image_url ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Package size={36} /></div>}
        {item.status === 'sold' && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><span className="px-3 py-1 rounded-full bg-white text-slate-900 font-bold text-sm">SOLD</span></div>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{item.price}</span>
          {cond && <span className="text-xs text-slate-400 dark:text-slate-500">{cond.label}</span>}
        </div>
        <div className="flex gap-2 mt-3">
          {item.status !== 'sold' && <button onClick={onMarkSold} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"><Check size={14} /> Mark Sold</button>}
          <button onClick={onDelete} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function SellerSetup({ onCreated }: { onCreated: (s: Seller) => void }) {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try { onCreated(await ensureSeller(name.trim(), whatsapp.trim())); }
    catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong'); }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mx-auto mb-4">
          <ShoppingBag size={32} />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Become a Seller</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Set up your seller profile. Takes 10 seconds, we promise.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div><label className={labelCls}>Your Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" required className={inputCls} /></div>
        <div><label className={labelCls}>WhatsApp Number</label><input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="e.g. 9876543210" required className={inputCls} /><p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Buyers will contact you on this number</p></div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Start Selling
        </button>
      </form>
    </div>
  );
}

function AddItemForm({ sellerId, onAdded, onCancel }: { sellerId: string; onAdded: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('other');
  const [condition, setCondition] = useState('used');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predError, setPredError] = useState('');

  async function handlePredictPrice() {
    if (!title.trim()) return;
    setPredicting(true); setPredError(''); setPrediction(null);
    try {
      const result = await predictPrice({ title: title.trim(), description: description.trim(), category, condition });
      setPrediction(result);
    } catch (err) {
      setPredError(err instanceof Error ? err.message : 'Prediction failed');
    }
    setPredicting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const { error: insertError } = await supabase.from('items').insert({
      seller_id: sellerId, title: title.trim(), description: description.trim(), price: Number(price), category, condition, image_url: imageUrl || null, status: 'available',
    });
    setSubmitting(false);
    if (insertError) setError(insertError.message); else onAdded();
  }

  return (
    <Modal open={true} onClose={onCancel} title="List a New Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl} folder="items" label="Item Photo" />
        <div><label className={labelCls}>Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Engineering Graphics notes, barely used" required className={inputCls} /></div>
        <div><label className={labelCls}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you're selling..." rows={3} required className={`${inputCls} resize-none`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Price (₹)</label><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 250" min="0" required className={inputCls} /></div>
          <div><label className={labelCls}>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        </div>
        <div>
          <label className={labelCls}>Condition</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CONDITIONS.map((c) => (
              <button key={c.value} type="button" onClick={() => setCondition(c.value)} className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${condition === c.value ? `bg-${c.color}-50 dark:bg-${c.color}-500/15 border-${c.color}-300 dark:border-${c.color}-500/40 text-${c.color}-700 dark:text-${c.color}-400` : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* AI Price Prediction */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-500/10 dark:to-blue-500/5 border border-sky-200 dark:border-sky-500/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white"><Sparkles size={16} /></div>
            <div>
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">AI Price Prediction</p>
              <p className="text-xs text-slate-400">Get a suggested price based on similar campus listings</p>
            </div>
          </div>
          <button type="button" onClick={handlePredictPrice} disabled={predicting || !title.trim()} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 disabled:opacity-50 transition-colors">
            {predicting ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {predicting ? 'Analyzing...' : 'Predict Price'}
          </button>
          {predError && <p className="text-sm text-rose-500 mt-2">{predError}</p>}
          {prediction && (
            <div className="mt-3 space-y-2 animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Average selling price:</span>
                <span className="text-lg font-bold text-sky-600 dark:text-sky-400">₹{prediction.low}–₹{prediction.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Suggested price:</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">₹{prediction.average}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Confidence:</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${prediction.confidence === 'high' ? 'bg-emerald-100 text-emerald-700' : prediction.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {prediction.confidence} {prediction.similarCount > 0 && `(${prediction.similarCount} similar)`}
                </span>
              </div>
              <button type="button" onClick={() => setPrice(String(prediction.average))} className="w-full mt-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-semibold text-sm hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors border border-sky-200 dark:border-slate-700">
                Use suggested price (₹{prediction.average})
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />} Publish Listing
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
