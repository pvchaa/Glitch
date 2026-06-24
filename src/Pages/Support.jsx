import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Brain, Loader2, Send, Phone, BookOpen, Shield, Smile } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const resources = [
  {
    icon: Phone,
    title: 'Crisis Hotline',
    description: 'If you\'re in crisis, call 988 (Suicide & Crisis Lifeline) or your local emergency number.',
    color: 'bg-destructive/10 text-destructive',
  },
  {
    icon: BookOpen,
    title: 'Diabetes Burnout',
    description: 'It\'s normal to feel overwhelmed. Take it one day at a time. You\'re doing better than you think.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Shield,
    title: 'Self-Compassion',
    description: 'Not every day will be perfect. A high blood sugar reading is data, not a grade.',
    color: 'bg-chart-4/10 text-chart-4',
  },
  {
    icon: Smile,
    title: 'You\'re Not Alone',
    description: 'Over 500 million people worldwide manage diabetes. Your community is here for you.',
    color: 'bg-chart-3/10 text-chart-3',
  },
];

export default function Support() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const talkToAI = async () => {
    if (!message.trim()) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a compassionate psychological support AI for people with diabetes. The user is reaching out for emotional support.

User's message: "${message}"

Respond with empathy, understanding, and gentle encouragement. Acknowledge their feelings. Normalize their experience. Offer practical coping strategies specific to living with diabetes. If they express severe distress, always recommend reaching out to a mental health professional.

Keep your response warm, personal, and under 200 words.`,
    });
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Psychological Support</h1>
        <p className="text-muted-foreground text-sm mt-1">You matter. Your feelings are valid.</p>
      </div>

      {/* Resources Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <Card key={resource.title} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl ${resource.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{resource.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Support Chat */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Talk to GlucoMind
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share how you're feeling. This is a safe, judgment-free space. GlucoMind will respond with compassion and practical support.
          </p>
          <Textarea
            placeholder="How are you feeling today? What's on your mind?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={talkToAI} disabled={loading || !message.trim()} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Share
          </Button>

          {response && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm">GlucoMind</span>
              </div>
              <div className="prose prose-sm max-w-none text-sm">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}