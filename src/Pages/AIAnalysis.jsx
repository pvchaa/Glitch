import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, HelpCircle, AlertTriangle, Loader2, Send, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AIAnalysis() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisAdvice, setCrisisAdvice] = useState('');
  const [crisisLoading, setCrisisLoading] = useState(false);

  const { data: logs = [] } = useQuery({
    queryKey: ['healthLogs'],
    queryFn: () => base44.entities.HealthLog.list('-date', 50),
  });

  const buildContext = () => {
    return logs.slice(0, 20).map(l => {
      const parts = [`${l.type} at ${l.date}`];
      if (l.blood_sugar_level) parts.push(`BS: ${l.blood_sugar_level}`);
      if (l.meal_description) parts.push(`Meal: ${l.meal_description}, ${l.meal_carbs}g carbs, GI: ${l.meal_glycemic_index}`);
      if (l.sleep_hours) parts.push(`Sleep: ${l.sleep_hours}hrs (${l.sleep_quality})`);
      if (l.stress_level) parts.push(`Stress: ${l.stress_level}/10`);
      if (l.exercise_type) parts.push(`${l.exercise_type}: ${l.exercise_duration}min (${l.exercise_intensity})`);
      if (l.insulin_units) parts.push(`Insulin: ${l.insulin_units}u ${l.insulin_type}`);
      if (l.menstrual_phase) parts.push(`Cycle: ${l.menstrual_phase}`);
      return parts.join(', ');
    }).join('\n');
  };

  const askWhy = async () => {
    if (!question.trim()) return;
    setLoading(true);
    const context = buildContext();
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are GlucoMind, a compassionate AI diabetes assistant. The user is asking about their blood sugar behavior. 

IMPORTANT: Always explain the "WHY" behind blood sugar behavior. Instead of "you have low blood sugar", say "you have low blood sugar BECAUSE..."

User's recent health data:
${context || 'No data logged yet.'}

User's question: ${question}

Provide a detailed, compassionate explanation. Use the health data to identify patterns and correlations. Reference specific data points when available. Include actionable advice.`,
    });
    setAnswer(result);
    setLoading(false);
  };

  const activateCrisisMode = async () => {
    setCrisisMode(true);
    setCrisisLoading(true);
    const context = buildContext();
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `CRISIS MODE ACTIVATED. You are GlucoMind AI in emergency response mode.

User's recent health data:
${context || 'No data available.'}

Provide IMMEDIATE, clear, step-by-step instructions for what to do RIGHT NOW.
Include:
1. Immediate actions (first 5 minutes)
2. What to eat/drink and exact amounts
3. When to recheck blood sugar
4. Warning signs to call emergency services
5. How to prevent this situation in the future

Be direct, calm, and specific. Use numbered steps. This is urgent.`,
    });
    setCrisisAdvice(result);
    setCrisisLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Analiza AI</h1>
        <p className="text-muted-foreground text-sm mt-1">Zrozum swoje ciało dzięki analizie opartej na AI</p>
      </div>

      {/* Crisis Mode Button */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-destructive">Tryb kryzysowy</p>
            <p className="text-sm text-muted-foreground">Natychmiastowe wskazówki przy nagłym zdarzeniu z cukrem</p>
          </div>
          <Button variant="destructive" onClick={activateCrisisMode} disabled={crisisLoading} className="gap-2 shrink-0">
            {crisisLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Aktywuj
          </Button>
        </CardContent>
      </Card>

      {crisisMode && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Zap className="w-5 h-5" /> Odpowiedź kryzysowa
            </CardTitle>
          </CardHeader>
          <CardContent>
            {crisisLoading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-destructive" />
                <span className="text-sm">Generuję instrukcje awaryjne...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{crisisAdvice}</ReactMarkdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Why? Function */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Zapytaj „Dlaczego?"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="np. Dlaczego cukier skoczył po obiedzie? Dlaczego rano mam zawsze wysokie wyniki?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={askWhy} disabled={loading || !question.trim()} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Zapytaj AI
          </Button>

          {answer && (
            <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">Analiza Glitch AI</span>
              </div>
              <div className="prose prose-sm max-w-none text-sm">
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}