import { ShoppingBag, MapPin, Users, ArrowRight, Sparkles, Zap } from 'lucide-react';
import type { View } from './Navbar';

interface HeroProps {
  onNavigate: (view: View) => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 dark:from-slate-950 dark:via-sky-950 dark:to-slate-950 animate-gradient" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.3) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(251, 146, 60, 0.2) 0%, transparent 50%),
                          radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`
      }} />

      <div className="absolute top-20 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sky-200 text-sm font-medium mb-6">
            <Sparkles size={14} />
            The campus marketplace that actually slaps
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Buy, sell, find stuff &
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">
              find your travel gang
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The one-stop hub for engineering students. Sell your old calculator, find your lost
            earbuds, and split a cab to the metro — all without leaving campus.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('buy')}
              className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-sky-50 transition-all hover:scale-105 shadow-xl"
            >
              <ShoppingBag size={18} />
              Browse Marketplace
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('sell')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
            >
              <Zap size={18} />
              Start Selling
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <FeatureCard icon={ShoppingBag} title="Marketplace" desc="Buy & sell clothes, food, notes, tickets & more" onClick={() => onNavigate('buy')} />
            <FeatureCard icon={MapPin} title="Lost & Found" desc="Lost your ID card? Someone probably found it" onClick={() => onNavigate('lost-found')} />
            <FeatureCard icon={Users} title="Travel Buddies" desc="Find companions for metro, outings & home trips" onClick={() => onNavigate('travel')} />
          </div>
        </div>
      </div>

      <div className="relative">
        <svg className="w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 20C1440 20 1200 60 720 40C240 20 0 40 0 40L0 80Z" className="fill-slate-50 dark:fill-slate-950" />
        </svg>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, desc, onClick,
}: {
  icon: typeof ShoppingBag; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-sky-400/30 transition-all hover:scale-[1.02]"
    >
      <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-300 mb-3 group-hover:scale-110 transition-transform">
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-white text-sm">{title}</h3>
      <p className="text-xs text-slate-400 mt-1">{desc}</p>
    </button>
  );
}
