import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Loader2, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function AIPrediction({ logs }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePrediction = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const recentLogs = logs.filter(l => l.date >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()).slice(0, 30);
    
    const summary = recentLogs.map(l => {
      const parts = [`${l.type} at ${l.date}`];
      if (l.blood_sugar_level) parts.push(`BS: ${l.blood_sugar_level}mg/dL`);
      if (l.meal_description) parts.push(`Meal: ${l.meal_description}, ${l.meal_carbs}g carbs`);
      if (l.sleep_hours) parts.push(`Sleep: ${l.sleep_hours}hrs, quality: ${l.sleep_quality}`);
      if (l.stress_level) parts.push(`Stress: ${l.stress_level}/10`);
      if (l.exercise_type) parts.push(`Exercise: ${l.exercise_type}, ${l.exercise_duration}min, ${l.exercise_intensity}`);
      if (l.insulin_units) parts.push(`Insulin: ${l.insulin_units}u ${l.insulin_type}`);
      if (l.menstrual_phase) parts.push(`Menstrual phase: ${l.menstrual_phase}`);
      return parts.join(', ');
    }).join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a diabetes management AI assistant. Based on the user's recent health logs, provide a day prediction for today.

Recent health data (last 3 days):
${summary || 'No data available yet - provide general guidance.'}

Provide:
1. A brief overall risk assessment for today
2. Predicted blood sugar patterns
3. Specific warnings based on patterns (sleep, stress, menstrual cycle effects)
4. 2-3 actionable recommendations for today

Be specific, compassionate, and explain the "why" behind each prediction. Use simple language.`,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string", enum: ["low", "moderate", "high"] },
          summary: { type: "string" },
          warnings: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
        }
      }
    });

    setPrediction(result);
    setLoading(false);
  };

  const riskColors = {
    low: 'text-primary bg-primary/10',
    moderate: 'text-accent bg-accent/10',
    high: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Predykcja AI
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generatePrediction} 
          disabled={loading}
          className="text-primary text-xs"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Analizuję...' : 'Generuj'}
        </Button>
      </CardHeader>
      <CardContent>
        {!prediction && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Kliknij Generuj aby otrzymać predykcję dnia opartą na AI</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Analizuję Twoje wzorce...</p>
          </div>
        )}
        {prediction && !loading && (
          <div className="space-y-4">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", riskColors[prediction.risk_level])}>
              {prediction.risk_level === 'high' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              {prediction.risk_level?.charAt(0).toUpperCase() + prediction.risk_level?.slice(1)} Risk Day
            </div>
            <p className="text-sm leading-relaxed">{prediction.summary}</p>
            {prediction.warnings?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Warnings</p>
                {prediction.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-accent/5 p-3 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
            {prediction.recommendations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</p>
                {prediction.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm bg-primary/5 p-3 rounded-lg">
                    <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}