import { useState } from 'react';
import { Navbar, type View } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { BuyView } from '@/components/marketplace/BuyView';
import { SellView } from '@/components/marketplace/SellView';
import { LostFoundView } from '@/components/lostandfound/LostFoundView';
import { TravelView } from '@/components/travel/TravelView';
import { useTheme } from '@/lib/theme';
import { GraduationCap, Heart } from 'lucide-react';

function App() {
  const [view, setView] = useState<View>('home');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar view={view} onNavigate={setView} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        {view === 'home' && (
          <>
            <Hero onNavigate={setView} />
            <HomeContent onNavigate={setView} />
          </>
        )}
        {view === 'buy' && <BuyView />}
        {view === 'sell' && <SellView />}
        {view === 'lost-found' && <LostFoundView />}
        {view === 'travel' && <TravelView />}
      </main>

      <Footer onNavigate={setView} />
    </div>
  );
}

function HomeContent({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <p className="font-display text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 max-w-3xl mx-auto leading-relaxed">
          "Engineering is 1% inspiration, 99% finding someone to split the cab fare with."
        </p>
        <p className="text-slate-400 dark:text-slate-500 mt-3 text-sm">— Every engineering student ever</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FeatureSection
          title="Marketplace"
          tagline="Sell it before it collects dust"
          desc="List your old notes, that air cooler you used once, or event tickets you can't attend. Buyers can search, filter by condition and price, and contact you directly on WhatsApp."
          features={['Search & filter by category, price, condition', 'Direct WhatsApp contact with sellers', 'Rate sellers on ease, honesty & quality']}
          color="sky"
          onClick={() => onNavigate('buy')}
          cta="Browse Items"
        />
        <FeatureSection
          title="Lost & Found"
          tagline="Because ID cards have a mind of their own"
          desc="Lost something on campus? Found someone's earbuds in the lecture hall? Post it here with a photo, location, and current status so the rightful owner can find it."
          features={['Post lost or found items with photos', 'Track status: with me, with authorities, returned', 'Location and contact details included']}
          color="amber"
          onClick={() => onNavigate('lost-found')}
          cta="Check Lost & Found"
        />
        <FeatureSection
          title="Travel Buddies"
          tagline="Solo trips are overrated"
          desc="Heading to the metro, airport, or home for the weekend? Find companions going the same way. Split cab fares, share the journey, and maybe make a friend."
          features={["Post where you're going and why", 'Add requirements like splitting fares', 'Connect directly via WhatsApp']}
          color="emerald"
          onClick={() => onNavigate('travel')}
          cta="Find Buddies"
        />
      </div>

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StepCard step="01" title="Browse or Post" desc="Search the marketplace for what you need, or list your own items in seconds." />
          <StepCard step="02" title="Connect on WhatsApp" desc="Found what you're looking for? Reach out to the seller directly — no middlemen." />
          <StepCard step="03" title="Rate & Review" desc="After the deal, rate the seller on ease, bargaining, quality, and honesty." />
        </div>
      </div>
    </div>
  );
}

function FeatureSection({
  title, tagline, desc, features, color, onClick, cta,
}: {
  title: string; tagline: string; desc: string; features: string[]; color: string; onClick: () => void; cta: string;
}) {
  return (
    <div className="flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-sky-500/5 dark:hover:border-slate-700 transition-all">
      <div className={`inline-block px-3 py-1 rounded-full bg-${color}-50 dark:bg-${color}-500/15 text-${color}-600 dark:text-${color}-400 text-xs font-semibold self-start mb-3`}>
        {tagline}
      </div>
      <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{desc}</p>
      <ul className="mt-4 space-y-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-${color}-400 shrink-0`} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        className={`mt-5 px-4 py-2.5 rounded-xl bg-${color}-500 text-white font-semibold text-sm hover:bg-${color}-600 transition-colors`}
      >
        {cta}
      </button>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
      <span className="font-display text-3xl font-bold text-sky-100 dark:text-sky-500/20">{step}</span>
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{desc}</p>
    </div>
  );
}

function Footer({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <footer className="bg-slate-900 dark:bg-slate-900/50 text-slate-400 py-10 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className="font-display font-bold text-white">CampusConnect</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button onClick={() => onNavigate('buy')} className="hover:text-white transition-colors">Buy</button>
            <button onClick={() => onNavigate('sell')} className="hover:text-white transition-colors">Sell</button>
            <button onClick={() => onNavigate('lost-found')} className="hover:text-white transition-colors">Lost & Found</button>
            <button onClick={() => onNavigate('travel')} className="hover:text-white transition-colors">Travel Buddies</button>
          </nav>
          <p className="text-xs flex items-center gap-1">
            Made with <Heart size={12} className="fill-rose-500 text-rose-500" /> for engineering students
          </p>
        </div>
      </div>
    </footer>
  );
}

export default App;
