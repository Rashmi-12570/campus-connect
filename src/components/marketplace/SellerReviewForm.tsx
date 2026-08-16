import { useState } from 'react';
import { Star, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RATING_CRITERIA } from '@/lib/types';

interface SellerReviewFormProps {
  sellerId: string;
  sellerName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

export function SellerReviewForm({ sellerId, sellerName, onSubmitted, onCancel }: SellerReviewFormProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({
    ease_rating: 5, bargaining_rating: 5, quality_rating: 5, honesty_rating: 5, item_quality_rating: 5,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerName.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('seller_ratings').insert({
      seller_id: sellerId, reviewer_name: reviewerName.trim(), ...ratings, comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (!error) { setSuccess(true); setTimeout(onSubmitted, 1000); }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
        <Check size={20} />
        <span className="font-medium">Review submitted! Thanks for keeping the campus honest.</span>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400';

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Name</label>
        <input type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="How should we call you?" required className={inputCls} />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Rate {sellerName} on:</p>
        {RATING_CRITERIA.map((criterion) => (
          <div key={criterion.key} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{criterion.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{criterion.hint}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRatings({ ...ratings, [criterion.key]: star })} className="transition-transform hover:scale-110">
                  <Star size={18} className={star <= ratings[criterion.key] ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-300 dark:text-slate-600'} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Comment (optional)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={2} className={`${inputCls} resize-none`} />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={submitting || !reviewerName.trim()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 disabled:opacity-50 transition-colors">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />} Submit Review
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
      </div>
    </form>
  );
}
