import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Watch, Bluetooth, CheckCircle, Zap } from 'lucide-react';
import { useState } from 'react';

const watches = [
  { id: 'apple', name: 'Apple Watch', desc: 'Series 4+, WatchOS 7+', logo: '🍎' },
  { id: 'samsung', name: 'Samsung Galaxy Watch', desc: 'Galaxy Watch 4+', logo: '💎' },
  { id: 'garmin', name: 'Garmin', desc: 'Venu, Forerunner, Fenix', logo: '🟠' },
  { id: 'fitbit', name: 'Fitbit / Google', desc: 'Sense, Versa 3+', logo: '💚' },
  { id: 'dexcom', name: 'Dexcom CGM', desc: 'G6, G7, ONE+', logo: '🔵' },
  { id: 'libre', name: 'FreeStyle Libre', desc: 'Libre 2, Libre 3', logo: '🔴' },
];

export default function SmartWatchModal({ open, onClose }) {
  const [selected, setSelected] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
  };

  const handleClose = () => {
    setSelected(null);
    setConnecting(false);
    setConnected(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Watch className="w-5 h-5 text-primary" />
            Podłącz Smartwatch
          </DialogTitle>
        </DialogHeader>

        {connected ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="font-semibold text-foreground">Połączono!</p>
            <p className="text-sm text-muted-foreground">
              {watches.find(w => w.id === selected)?.name} jest teraz synchronizowany z Glitch.
            </p>
            <Button onClick={handleClose} className="w-full mt-2">Gotowe</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Wybierz urządzenie do synchronizacji danych zdrowotnych.</p>
            
            <div className="relative overflow-hidden rounded-xl mb-2 h-32">
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80&fit=crop" 
                alt="Smartwatch"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Bluetooth className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs text-muted-foreground">Skanowanie urządzeń...</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {watches.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelected(w.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selected === w.id
                      ? 'border-primary/50 bg-primary/10 shadow-sm shadow-primary/10'
                      : 'border-border/40 bg-muted/20 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="text-xl mb-1">{w.logo}</div>
                  <p className="text-xs font-semibold leading-tight">{w.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{w.desc}</p>
                </button>
              ))}
            </div>

            <Button
              onClick={handleConnect}
              disabled={!selected || connecting}
              className="w-full gap-2"
            >
              {connecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Łączenie...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Połącz urządzenie
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}