import { GraduationCap, ShoppingBag, Search, Package, MapPin, Users, Sun, Moon } from 'lucide-react';

export type View = 'home' | 'buy' | 'sell' | 'lost-found' | 'travel';

interface NavbarProps {
  view: View;
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const NAV_ITEMS: { id: View; label: string; icon: typeof ShoppingBag }[] = [
  { id: 'buy', label: 'Buy', icon: Search },
  { id: 'sell', label: 'Sell', icon: Package },
  { id: 'lost-found', label: 'Lost & Found', icon: MapPin },
  { id: 'travel', label: 'Travel Buddies', icon: Users },
];

export function Navbar({ view, onNavigate, theme, onToggleTheme }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="text-white" size={22} />
            </div>
            <div className="text-left">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white leading-none block">
                Campus<span className="text-sky-500">Connect</span>
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
                buy . sell . find . travel
              </span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex md:hidden items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    active ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
