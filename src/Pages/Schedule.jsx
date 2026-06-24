import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Clock, AlertTriangle, Trash2, Brain, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const eventTypeColors = {
  meal: 'bg-chart-3/10 text-chart-3',
  exercise: 'bg-chart-2/10 text-chart-2',
  medication: 'bg-primary/10 text-primary',
  appointment: 'bg-chart-4/10 text-chart-4',
  work: 'bg-secondary text-secondary-foreground',
  test: 'bg-accent/10 text-accent',
  other: 'bg-muted text-muted-foreground',
};

export default function Schedule() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ time: '', title: '', type: 'other', notes: '' });
  const [aiLoading, setAiLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules'],
    queryFn: () => base44.entities.DailySchedule.list('-date', 30),
  });

  const todaySchedule = schedules.find(s => s.date === selectedDate);
  const events = todaySchedule?.events || [];

  const saveMutation = useMutation({
    mutationFn: async (updatedEvents) => {
      if (todaySchedule) {
        return base44.entities.DailySchedule.update(todaySchedule.id, { events: updatedEvents });
      } else {
        return base44.entities.DailySchedule.create({ date: selectedDate, events: updatedEvents });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const addEvent = () => {
    if (!newEvent.time || !newEvent.title) return;
    const updatedEvents = [...events, newEvent].sort((a, b) => a.time.localeCompare(b.time));
    saveMutation.mutate(updatedEvents);
    setNewEvent({ time: '', title: '', type: 'other', notes: '' });
    setDialogOpen(false);
    toast.success('Event added');
  };

  const removeEvent = (index) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    saveMutation.mutate(updatedEvents);
  };

  const analyzeSchedule = async () => {
    setAiLoading(true);
    const eventsText = events.map(e => `${e.time} - ${e.title} (${e.type})`).join('\n');
    
    const { data: logs = [] } = queryClient.getQueryData(['healthLogs']) 
      ? { data: queryClient.getQueryData(['healthLogs']) }
      : { data: [] };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are GlucoMind AI. Analyze this day's schedule for a person with diabetes and add health impact annotations.

Schedule for ${selectedDate}:
${eventsText || 'No events yet'}

For each event, provide a brief health impact note (e.g., stress impact on blood sugar, exercise effects, meal timing concerns).
Also flag any potential risks or suggestions.`,
      response_json_schema: {
        type: "object",
        properties: {
          annotated_events: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time: { type: "string" },
                title: { type: "string" },
                type: { type: "string" },
                health_impact: { type: "string" },
                notes: { type: "string" },
              }
            }
          },
          overall_advice: { type: "string" },
        }
      }
    });

    if (result.annotated_events) {
      saveMutation.mutate(result.annotated_events);
    }
    setAiLoading(false);
    toast.success('Schedule analyzed by AI');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Daily Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan your day with health-aware annotations</p>
        </div>
        <div className="flex gap-2">
          <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-auto" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={newEvent.time} onChange={e => setNewEvent(p => ({ ...p, time: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newEvent.type} onValueChange={v => setNewEvent(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meal">Meal</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="test">Test/Exam</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input placeholder="Optional notes" value={newEvent.notes} onChange={e => setNewEvent(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button onClick={addEvent} className="w-full">Add Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Button variant="outline" onClick={analyzeSchedule} disabled={aiLoading || events.length === 0} className="gap-2">
        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
        AI Health Impact Analysis
      </Button>

      <Card className="border-border/50">
        <CardContent className="p-4">
          {events.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">No events scheduled. Add your first event.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group">
                  <div className="text-sm font-mono font-medium text-muted-foreground w-14 shrink-0 pt-0.5">
                    {event.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{event.title}</span>
                      <Badge variant="secondary" className={cn("text-xs", eventTypeColors[event.type])}>
                        {event.type}
                      </Badge>
                    </div>
                    {event.health_impact && (
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-accent">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{event.health_impact}</span>
                      </div>
                    )}
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => removeEvent(i)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}