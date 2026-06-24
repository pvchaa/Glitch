import { Card } from '@/components/ui/card';
import { Droplets, Moon, Brain, Flame, Syringe } from 'lucide-react';
import { cn } from '@/lib/utils';

const statConfig = {
  blood_sugar: { icon: Droplets, label: 'Cukier', unit: 'mg/dL', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  sleep: { icon: Moon, label: 'Sen', unit: 'godz', color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/20' },
  stress: { icon: Brain, label: 'Stres', unit: '/10', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20' },
  exercise: { icon: Flame, label: 'Ruch', unit: 'min', color: 'text-chart-3', bg: 'bg-chart-3/10 border-chart-3/20' },
  insulin: { icon: Syringe, label: 'Insulina', unit: 'j.', color: 'text-chart-5', bg: 'bg-chart-5/10 border-chart-5/20' },
};

export default function QuickStats({ logs }) {
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter(l => l.date?.startsWith(today));

  const latestBS = todayLogs.find(l => l.type === 'blood_sugar');
  const latestSleep = todayLogs.find(l => l.type === 'sleep');
  const latestStress = todayLogs.find(l => l.type === 'stress');
  const exerciseMins = todayLogs.filter(l => l.type === 'exercise').reduce((acc, l) => acc + (l.exercise_duration || 0), 0);
  const insulinTotal = todayLogs.filter(l => l.type === 'insulin').reduce((acc, l) => acc + (l.insulin_units || 0), 0);

  const stats = [
    { key: 'blood_sugar', value: latestBS?.blood_sugar_level || null },
    { key: 'sleep', value: latestSleep?.sleep_hours || null },
    { key: 'stress', value: latestStress?.stress_level || null },
    { key: 'exercise', value: exerciseMins || null },
    { key: 'insulin', value: insulinTotal || null },
  ];

  return (
    <div className="grid grid-cols-5 gap-2 md:gap-3">
      {stats.map(({ key, value }) => {
        const config = statConfig[key];
        const Icon = config.icon;
        return (
          <Card key={key} className={cn("p-3 md:p-4 border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/60 backdrop-blur-sm", config.bg)}>
            <div className={cn("p-1.5 rounded-lg w-fit mb-2", config.bg)}>
              <Icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4", config.color)} />
            </div>
            <p className={cn("text-lg md:text-2xl font-bold tracking-tight", value ? config.color : 'text-muted-foreground/40')}>
              {value ?? '—'}
              {value && <span className="text-[9px] md:text-xs font-normal text-muted-foreground ml-0.5">{config.unit}</span>}
            </p>
            <p className="text-[9px] md:text-xs text-muted-foreground mt-0.5 leading-tight">{config.label}</p>
          </Card>
        );
      })}
    </div>
  );
}