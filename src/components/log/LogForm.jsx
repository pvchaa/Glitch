import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Save, Camera, Loader2, Leaf } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import GIAdvice from '@/components/log/GIAdvice';

export default function LogForm({ type, onSave, saving }) {
  const [data, setData] = useState({});
  const [scanning, setScanning] = useState(false);

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const handleMealScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('meal_photo_url', file_url);
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: "Przeanalizuj to zdjęcie posiłku. Oszacuj makroskładniki (węglowodany, białko, tłuszcz, kalorie) i indeks glikemiczny (low/medium/high). Bądź jak najbardziej dokładny.",
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          meal_description: { type: "string" },
          meal_carbs: { type: "number" },
          meal_protein: { type: "number" },
          meal_fat: { type: "number" },
          meal_calories: { type: "number" },
          meal_glycemic_index: { type: "string", enum: ["low", "medium", "high"] },
          suggestion: { type: "string" }
        }
      }
    });
    
    setData(prev => ({ ...prev, ...result }));
    setScanning(false);
  };

  const handleSubmit = () => {
    onSave({
      type,
      date: new Date().toISOString(),
      ...data,
    });
  };

  const typeLabels = {
    blood_sugar: 'Cukier we krwi',
    meal: 'Posiłek',
    insulin: 'Insulina',
    exercise: 'Ćwiczenia',
    sleep: 'Sen',
    stress: 'Stres',
    menstrual: 'Cykl menstruacyjny',
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-display">{typeLabels[type] || type} — szczegóły</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'blood_sugar' && (
          <div className="space-y-2">
            <Label>Poziom cukru we krwi (mg/dL)</Label>
            <Input type="number" placeholder="120" value={data.blood_sugar_level || ''} onChange={e => update('blood_sugar_level', Number(e.target.value))} />
          </div>
        )}

        {type === 'meal' && (
          <>
            <div className="space-y-2">
              <Label>Opis posiłku</Label>
              <Input placeholder="np. Grillowany kurczak z ryżem" value={data.meal_description || ''} onChange={e => update('meal_description', e.target.value)} />
            </div>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <input type="file" accept="image/*" onChange={handleMealScan} className="hidden" id="meal-photo" />
              <label htmlFor="meal-photo" className="cursor-pointer flex flex-col items-center gap-2">
                {scanning ? <Loader2 className="w-8 h-8 animate-spin text-primary" /> : <Camera className="w-8 h-8 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">{scanning ? 'AI skanuje posiłek...' : 'Zeskanuj posiłek z AI'}</span>
              </label>
            </div>
            {data.meal_photo_url && (
              <img src={data.meal_photo_url} alt="Posiłek" className="w-full h-48 object-cover rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Węglowodany (g)</Label>
                <Input type="number" placeholder="0" value={data.meal_carbs || ''} onChange={e => update('meal_carbs', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Białko (g)</Label>
                <Input type="number" placeholder="0" value={data.meal_protein || ''} onChange={e => update('meal_protein', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tłuszcz (g)</Label>
                <Input type="number" placeholder="0" value={data.meal_fat || ''} onChange={e => update('meal_fat', Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Kalorie</Label>
                <Input type="number" placeholder="0" value={data.meal_calories || ''} onChange={e => update('meal_calories', Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Indeks glikemiczny</Label>
              <Select value={data.meal_glycemic_index || ''} onValueChange={v => update('meal_glycemic_index', v)}>
                <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niski</SelectItem>
                  <SelectItem value="medium">Średni</SelectItem>
                  <SelectItem value="high">Wysoki</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* GI Advice panel */}
            {(data.meal_description || data.meal_glycemic_index) && (
              <GIAdvice
                mealDescription={data.meal_description}
                glycemicIndex={data.meal_glycemic_index}
                carbs={data.meal_carbs}
              />
            )}
          </>
        )}

        {type === 'insulin' && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Dawka insuliny</Label>
                <div className="flex items-center border border-border/60 rounded-lg overflow-hidden text-xs">
                  <button
                    type="button"
                    onClick={() => update('insulin_unit_type', 'units')}
                    className={`px-3 py-1.5 font-medium transition-colors ${(!data.insulin_unit_type || data.insulin_unit_type === 'units') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    units
                  </button>
                  <button
                    type="button"
                    onClick={() => update('insulin_unit_type', 'j')}
                    className={`px-3 py-1.5 font-medium transition-colors ${data.insulin_unit_type === 'j' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                  >
                    j.
                  </button>
                </div>
              </div>
              <Input
                type="number"
                placeholder="0"
                value={data.insulin_units || ''}
                onChange={e => update('insulin_units', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                {data.insulin_units ? `${data.insulin_units} ${data.insulin_unit_type === 'j' ? 'j.' : 'units'} insuliny` : ''}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Rodzaj insuliny</Label>
              <Select value={data.insulin_type || ''} onValueChange={v => update('insulin_type', v)}>
                <SelectTrigger><SelectValue placeholder="Wybierz rodzaj" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rapid">Szybkodziałająca</SelectItem>
                  <SelectItem value="long_acting">Długodziałająca</SelectItem>
                  <SelectItem value="mixed">Mieszana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === 'exercise' && (
          <>
            <div className="space-y-2">
              <Label>Rodzaj ćwiczeń</Label>
              <Input placeholder="np. Bieganie, Pływanie" value={data.exercise_type || ''} onChange={e => update('exercise_type', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Czas trwania (minuty)</Label>
              <Input type="number" placeholder="30" value={data.exercise_duration || ''} onChange={e => update('exercise_duration', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Intensywność</Label>
              <Select value={data.exercise_intensity || ''} onValueChange={v => update('exercise_intensity', v)}>
                <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niska</SelectItem>
                  <SelectItem value="moderate">Umiarkowana</SelectItem>
                  <SelectItem value="high">Wysoka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === 'sleep' && (
          <>
            <div className="space-y-2">
              <Label>Godziny snu</Label>
              <Input type="number" step="0.5" placeholder="7.5" value={data.sleep_hours || ''} onChange={e => update('sleep_hours', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Jakość snu</Label>
              <Select value={data.sleep_quality || ''} onValueChange={v => update('sleep_quality', v)}>
                <SelectTrigger><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Zła</SelectItem>
                  <SelectItem value="fair">Przeciętna</SelectItem>
                  <SelectItem value="good">Dobra</SelectItem>
                  <SelectItem value="excellent">Doskonała</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {type === 'stress' && (
          <div className="space-y-4">
            <Label>Poziom stresu: {data.stress_level || 5}/10</Label>
            <Slider
              value={[data.stress_level || 5]}
              onValueChange={([v]) => update('stress_level', v)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spokój</span>
              <span>Bardzo wysoki</span>
            </div>
          </div>
        )}

        {type === 'menstrual' && (
          <div className="space-y-2">
            <Label>Faza cyklu</Label>
            <Select value={data.menstrual_phase || ''} onValueChange={v => update('menstrual_phase', v)}>
              <SelectTrigger><SelectValue placeholder="Wybierz fazę" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="menstruation">Menstruacja</SelectItem>
                <SelectItem value="follicular">Folikularna</SelectItem>
                <SelectItem value="ovulation">Owulacja</SelectItem>
                <SelectItem value="luteal">Lutealna</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Notatki (opcjonalnie)</Label>
          <Textarea placeholder="Dodatkowe uwagi..." value={data.notes || ''} onChange={e => update('notes', e.target.value)} />
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz wpis
        </Button>
      </CardContent>
    </Card>
  );
}