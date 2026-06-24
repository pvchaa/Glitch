import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Moon, Brain, Flame, Syringe, Utensils, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const typeConfig = {
  blood_sugar: { icon: Droplets, label: 'Cukier we krwi', color: 'text-primary bg-primary/10' },
  meal: { icon: Utensils, label: 'Posiłek', color: 'text-chart-3 bg-chart-3/10' },
  sleep: { icon: Moon, label: 'Sen', color: 'text-chart-4 bg-chart-4/10' },
  stress: { icon: Brain, label: 'Stres', color: 'text-chart-2 bg-chart-2/10' },
  exercise: { icon: Flame, label: 'Ćwiczenia', color: 'text-chart-5 bg-chart-5/10' },
  insulin: { icon: Syringe, label: 'Insulina', color: 'text-chart-1 bg-chart-1/10' },
  menstrual: { icon: Activity, label: 'Cykl', color: 'text-destructive bg-destructive/10' },
};

const getSummary = (log) => {
  switch (log.type) {
    case 'blood_sugar': return `${log.blood_sugar_level} mg/dL`;
    case 'meal': return log.meal_description || (log.meal_carbs ? `${log.meal_carbs}g węglowodanów` : 'Posiłek');
    case 'sleep': return `${log.sleep_hours} godz · ${log.sleep_quality || ''}`;
    case 'stress': return `Poziom ${log.stress_level}/10`;
    case 'exercise': return `${log.exercise_type || 'Ćwiczenia'} · ${log.exercise_duration} min`;
    case 'insulin': return `${log.insulin_units} j. · ${log.insulin_type === 'rapid' ? 'szybka' : log.insulin_type === 'long_acting' ? 'długa' : 'mieszana'}`;
    case 'menstrual': return log.menstrual_phase || 'Faza cyklu';
    default: return log.notes || '';
  }
};

export default function RecentLogs({ logs }) {
  const recent = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Ostatnia aktywność
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 px-6">Brak wpisów. Zacznij śledzić swoje zdrowie!</p>
        ) : (
          <div className="divide-y divide-border/30">
            {recent.map((log) => {
              const config = typeConfig[log.type] || typeConfig.blood_sugar;
              const Icon = config.icon;
              return (
                <div key={log.id} className="flex items-center gap-3 px-4 md:px-5 py-3 hover:bg-muted/20 transition-colors">
                  <div className={cn("p-2 rounded-xl shrink-0", config.color)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{config.label}</p>
                    <p className="text-sm font-semibold truncate">{getSummary(log)}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {log.date ? format(new Date(log.date), 'HH:mm') : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}