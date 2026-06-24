import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Leaf, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const giColors = {
  low: 'border-green-500/30 bg-green-500/5 text-green-400',
  medium: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
  high: 'border-red-500/30 bg-red-500/5 text-red-400',
};

const giLabels = {
  low: 'Niski IG',
  medium: 'Średni IG',
  high: 'Wysoki IG',
};

export default function GIAdvice({ mealDescription, glycemicIndex, carbs }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const getAdvice = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Użytkownik z cukrzycą właśnie dodał posiłek: "${mealDescription || 'nieznany posiłek'}"
Indeks glikemiczny: ${glycemicIndex || 'nieznany'}${carbs ? `, węglowodany: ${carbs}g` : ''}.

Na podstawie tego posiłku podaj krótkie, praktyczne porady CO DODAĆ lub CO ZJEŚĆ RAZEM z tym posiłkiem, aby obniżyć jego indeks glikemiczny i zmniejszyć skoki cukru. 

Odpowiedz w formie listy 3-5 konkretnych propozycji po polsku. Każda propozycja max 1-2 zdania. Nie pisz wstępu, tylko lista.`,
      response_json_schema: {
        type: "object",
        properties: {
          tips: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    setAdvice(result.tips || []);
    setLoading(false);
    setExpanded(true);
  };

  const colorClass = giColors[glycemicIndex] || giColors.medium;

  return (
    <div className={`rounded-xl border p-4 ${colorClass} space-y-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {glycemicIndex ? giLabels[glycemicIndex] : 'Analiza IG'}
            {glycemicIndex === 'high' && ' — wskazówki jak obniżyć'}
            {glycemicIndex === 'medium' && ' — wskazówki jak poprawić'}
            {glycemicIndex === 'low' && ' — świetny wybór!'}
          </span>
        </div>
        {advice && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs opacity-60 hover:opacity-100">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {!advice && !loading && (
        <Button
          size="sm"
          variant="outline"
          onClick={getAdvice}
          className="w-full gap-2 border-current/30 bg-transparent hover:bg-white/5 text-inherit text-xs"
        >
          <Leaf className="w-3.5 h-3.5" />
          Co dodać do posiłku aby obniżyć IG?
        </Button>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm opacity-70">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analizuję posiłek...
        </div>
      )}

      {advice && expanded && (
        <ul className="space-y-2">
          {advice.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm opacity-90">
              <span className="shrink-0 font-bold">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}