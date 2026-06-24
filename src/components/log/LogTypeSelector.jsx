import { Utensils, Moon, Brain, Flame, Syringe, Droplets, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const logTypes = [
  { value: 'blood_sugar', icon: Droplets, label: 'Blood Sugar', color: 'bg-chart-1/10 text-chart-1 border-chart-1/20' },
  { value: 'meal', icon: Utensils, label: 'Meal', color: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  { value: 'insulin', icon: Syringe, label: 'Insulin', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'exercise', icon: Flame, label: 'Exercise', color: 'bg-chart-2/10 text-chart-2 border-chart-2/20' },
  { value: 'sleep', icon: Moon, label: 'Sleep', color: 'bg-chart-4/10 text-chart-4 border-chart-4/20' },
  { value: 'stress', icon: Brain, label: 'Stress', color: 'bg-accent/10 text-accent border-accent/20' },
  { value: 'menstrual', icon: Heart, label: 'Menstrual', color: 'bg-chart-5/10 text-chart-5 border-chart-5/20' },
];

export default function LogTypeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
      {logTypes.map(({ value, icon: Icon, label, color }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={cn(
            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
            selected === value
              ? cn(color, "border-current shadow-md scale-105")
              : "border-border hover:border-muted-foreground/30 bg-card"
          )}
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}