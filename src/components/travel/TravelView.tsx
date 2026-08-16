import { useEffect, useState } from 'react';
import {
  Users, Plus, Loader2, Search, MapPin, Calendar, Phone, User, MessageCircle, Train,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TravelCompanion } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';
const searchCls = 'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-shadow';

export function TravelView() {
  const [posts, setPosts] = useState<TravelCompanion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase.from('travel_companions').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (!error && data) setPosts(data as TravelCompanion[]);
  }

  const filtered = posts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.destination.toLowerCase().includes(q) || p.reason.toLowerCase().includes(q) || p.poster_name.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Travel Buddies</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Split the cab, share the ride, make the trip less boring.</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by destination, reason, or name..." className={searchCls} />
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/20">
          <Plus size={18} /><span className="hidden sm:inline">Find Buddies</span>
        </button>
      </div>

      {loading ? <LoadingSpinner label="Finding travel buddies..." />
      : filtered.length === 0 ? <EmptyState icon={<Train size={28} />} title="No travel plans yet" subtitle="Be the first to post. Someone else is probably heading the same way and dreading the solo trip too." />
      : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((post) => <TravelCard key={post.id} post={post} />)}
        </div>
      )}

      {showForm && <TravelForm onAdded={() => { setShowForm(false); fetchPosts(); }} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function TravelCard({ post }: { post: TravelCompanion }) {
  const waLink = post.contact_number ? `https://wa.me/${post.contact_number.replace(/[^0-9]/g, '')}` : '#';
  const dateStr = post.travel_date ? new Date(post.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Flexible';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/15 flex items-center justify-center text-sky-500 dark:text-sky-400"><MapPin size={20} /></div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{post.destination}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">by {post.poster_name}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{post.reason}</p>
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-3"><Calendar size={14} />{dateStr}</div>
      {post.requirements && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 mb-3">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-0.5">Requirements</p>
          <p className="text-sm text-amber-800 dark:text-amber-300">{post.requirements}</p>
        </div>
      )}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><User size={14} className="text-slate-400" />{post.contact_name}</div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Phone size={14} className="text-slate-400" />{post.contact_number}</div>
      </div>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors">
        <MessageCircle size={16} /> Connect on WhatsApp
      </a>
    </div>
  );
}

function TravelForm({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const [posterName, setPosterName] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const { error: insertError } = await supabase.from('travel_companions').insert({
      poster_name: posterName.trim(), destination: destination.trim(), reason: reason.trim(), travel_date: travelDate || null, requirements: requirements.trim() || null, contact_name: contactName.trim(), contact_number: contactNumber.trim(),
    });
    setSubmitting(false);
    if (insertError) setError(insertError.message); else onAdded();
  }

  return (
    <Modal open={true} onClose={onCancel} title="Find Travel Buddies">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className={labelCls}>Your Name</label><input type="text" value={posterName} onChange={(e) => setPosterName(e.target.value)} placeholder="e.g. Priya Patel" required className={inputCls} /></div>
        <div><label className={labelCls}>Where to?</label><input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Metro Station, Airport, Home town" required className={inputCls} /></div>
        <div><label className={labelCls}>Why are you going?</label><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Going home for the weekend, airport for flight, exploring the city..." rows={2} required className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>Travel Date (optional)</label><input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Requirements / Requests</label><textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="e.g. Split cab fare, need help with luggage, looking for same hometown buddies..." rows={2} className={`${inputCls} resize-none`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Contact Name</label><input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Who to reach" required className={inputCls} /></div>
          <div><label className={labelCls}>WhatsApp Number</label><input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. 9876543210" required className={inputCls} /></div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 disabled:opacity-50 transition-colors">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />} Post Request
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
