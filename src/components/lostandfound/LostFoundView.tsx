import { useEffect, useState } from 'react';
import {
  MapPin, Plus, Loader2, Search, MapPinned, PackageSearch, Phone, User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { LostFoundPost } from '@/lib/types';
import { LF_STATUSES } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Modal } from '@/components/ui/Modal';

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';
const searchCls = 'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow';

export function LostFoundView() {
  const [posts, setPosts] = useState<LostFoundPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase.from('lost_found').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (!error && data) setPosts(data as LostFoundPost[]);
  }

  const filtered = posts.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
    }
    if (filterType !== 'all' && p.type !== filterType) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Lost & Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Lost your ID card? Found someone's airpods? Let's reunite them.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by item name or location..." className={searchCls} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setFilterType('all')} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${filterType === 'all' ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>All</button>
          <button onClick={() => setFilterType('lost')} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${filterType === 'lost' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>Lost</button>
          <button onClick={() => setFilterType('found')} className={`px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${filterType === 'found' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>Found</button>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
          <Plus size={18} /><span className="hidden sm:inline">Post</span>
        </button>
      </div>

      {loading ? <LoadingSpinner label="Scanning the campus..." />
      : filtered.length === 0 ? <EmptyState icon={<MapPinned size={28} />} title="No posts yet" subtitle="Be the first to post. Someone out there is looking for their lost stuff right now." />
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post) => <LostFoundCard key={post.id} post={post} />)}
        </div>
      )}

      {showForm && <LostFoundForm onAdded={() => { setShowForm(false); fetchPosts(); }} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function LostFoundCard({ post }: { post: LostFoundPost }) {
  const status = LF_STATUSES.find((s) => s.value === post.status);
  const isLost = post.type === 'lost';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
        {post.image_url ? <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><PackageSearch size={44} /></div>}
        <span className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-bold rounded-full ${isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{isLost ? 'LOST' : 'FOUND'}</span>
        {status && <span className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-${status.color}-100 text-${status.color}-700`}>{status.label}</span>}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">{post.title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{post.description}</p>
        <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 mt-2"><MapPin size={14} />{post.location}</div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><User size={14} className="text-slate-400" />{post.contact_name}</div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Phone size={14} className="text-slate-400" />{post.contact_number}</div>
        </div>
      </div>
    </div>
  );
}

function LostFoundForm({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const [type, setType] = useState('found');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('with_me');
  const [imageUrl, setImageUrl] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const { error: insertError } = await supabase.from('lost_found').insert({
      type, title: title.trim(), description: description.trim(), location: location.trim(), image_url: imageUrl || null, status, contact_name: contactName.trim(), contact_number: contactNumber.trim(),
    });
    setSubmitting(false);
    if (insertError) setError(insertError.message); else onAdded();
  }

  return (
    <Modal open={true} onClose={onCancel} title="Post Lost or Found Item">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { setType('lost'); setStatus('with_me'); }} className={`px-4 py-3 rounded-xl font-semibold text-sm border transition-colors ${type === 'lost' ? 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>I lost something</button>
          <button type="button" onClick={() => { setType('found'); setStatus('with_me'); }} className={`px-4 py-3 rounded-xl font-semibold text-sm border transition-colors ${type === 'found' ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>I found something</button>
        </div>
        <ImageUpload onUpload={setImageUrl} currentUrl={imageUrl} folder="lost-found" label="Photo (optional)" />
        <div><label className={labelCls}>What is it?</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Blue ID card, Black earbuds case" required className={inputCls} /></div>
        <div><label className={labelCls}>Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details like color, brand, distinguishing features..." rows={2} required className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Library 2nd floor, near Canteen" required className={inputCls} /></div>
        {type === 'found' && (
          <div>
            <label className={labelCls}>Current Status</label>
            <div className="grid grid-cols-1 gap-2">
              {LF_STATUSES.filter((s) => s.value !== 'returned').map((s) => (
                <button key={s.value} type="button" onClick={() => setStatus(s.value)} className={`px-3 py-2.5 rounded-lg text-sm font-medium border text-left transition-colors ${status === s.value ? `bg-${s.color}-50 dark:bg-${s.color}-500/15 border-${s.color}-300 dark:border-${s.color}-500/40 text-${s.color}-700 dark:text-${s.color}-400` : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Contact Name</label><input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" required className={inputCls} /></div>
          <div><label className={labelCls}>Contact Number</label><input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="Your number" required className={inputCls} /></div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Post
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
