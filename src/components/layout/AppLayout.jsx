import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Calendar, Users, 
  Phone, Heart, Brain, Menu, X, Zap
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/log', icon: Activity, label: 'Dziennik' },
  { path: '/schedule', icon: Calendar, label: 'Harmonogram' },
  { path: '/ai-analysis', icon: Brain, label: 'Analiza AI' },
  { path: '/community', icon: Users, label: 'Społeczność' },
  { path: '/support', icon: Heart, label: 'Wsparcie' },
  { path: '/emergency', icon: Phone, label: 'Kontakty' },
];

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border/40 bg-card/60 backdrop-blur-xl fixed h-full z-30">
        <div className="p-5 border-b border-border/40">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Glitch</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Metabolizm 360°</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active 
                    ? "bg-primary/15 text-primary border border-primary/20 shadow-sm shadow-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border/40">
          <p className="text-[10px] text-muted-foreground text-center">v1.0 · Glitch Health</p>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-card/80 backdrop-blur-xl border-b border-border/40 z-40 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Glitch</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="h-8 w-8">
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-14 left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border/40 p-3 space-y-0.5" onClick={e => e.stopPropagation()}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    active 
                      ? "bg-primary/15 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/40 z-40 flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.slice(0, 5).map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-[52px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary))]")} />
              <span className="text-[9px] font-medium leading-none">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 pb-20 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}