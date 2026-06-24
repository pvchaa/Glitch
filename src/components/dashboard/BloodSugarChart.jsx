import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function BloodSugarChart({ logs }) {
  const bsLogs = logs.
  filter((l) => l.type === 'blood_sugar' && l.blood_sugar_level).
  sort((a, b) => new Date(a.date) - new Date(b.date)).
  slice(-20).
  map((l) => ({
    time: format(new Date(l.date), 'HH:mm'),
    value: l.blood_sugar_level,
    date: format(new Date(l.date), 'MMM d')
  }));

  if (bsLogs.length === 0) {
    return (
      <Card className="border-border/40 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base font-display">Poziom cukru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Brak odczytów. Zacznij logować aby zobaczyć trend.
          </div>
        </CardContent>
      </Card>);

  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-base font-display">Poziom cukru</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={bsLogs}>
            <defs>
              <linearGradient id="bsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[50, 300]} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '0.875rem'
              }} />
            
            <ReferenceLine y={70} stroke="hsl(var(--destructive))" strokeDasharray="4 4" label="Low" />
            <ReferenceLine y={180} stroke="hsl(var(--accent))" strokeDasharray="4 4" label="High" />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="url(#bsGradient)"
              strokeWidth={2.5}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }} />
            
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>);

}