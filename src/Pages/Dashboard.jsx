import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, Watch, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickStats from '@/components/dashboard/QuickStats';
import BloodSugarChart from '@/components/dashboard/BloodSugarChart';
import AIPrediction from '@/components/dashboard/AIPrediction';
import RecentLogs from '@/components/dashboard/RecentLogs';
import SmartWatchModal from '@/components/dashboard/SmartWatchModal';
import { useState } from 'react';

export default function Dashboard() {
  const [watchModal, setWatchModal] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['healthLogs'],
    queryFn: () => base44.entities.HealthLog.list('-date', 100),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-5 md:p-6">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center'}} />
        <div className="absolute inset-0 bg-gradient-to-r from-card/90 via-card/70 to-transparent" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-widest">Glitch</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Twój cyfrowy metabolizm w zasięgu ręki</p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link to="/log">
              <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20 w-full">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dodaj wpis</span>
                <span className="sm:hidden">Dodaj</span>
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-border/60 bg-card/50 backdrop-blur-sm w-full"
              onClick={() => setWatchModal(true)}
            >
              <Watch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Smartwatch</span>
              <span className="sm:hidden">Watch</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats logs={logs} />

      {/* Charts and Prediction */}
      <div className="grid md:grid-cols-2 gap-4">
        <BloodSugarChart logs={logs} />
        <AIPrediction logs={logs} />
      </div>

      {/* Recent Activity */}
      <RecentLogs logs={logs} />

      <SmartWatchModal open={watchModal} onClose={() => setWatchModal(false)} />
    </div>
  );
}