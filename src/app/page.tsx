'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { improvePromptTemplate } from '@/ai/flows/improve-prompt-template';
import { Loader2 } from 'lucide-react';
import TextAnalyzer from '@/components/TextAnalyzer';

const API_ENDPOINT = '/api/analyze';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);

  useEffect(() => {
    document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1496181173195-d3385aacea93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
    };
  }, []);

  const handleImprovePrompt = async () => {
    setIsImprovingPrompt(true);
    try {
      const result = await improvePromptTemplate({
        originalPrompt: `You are a deception analysis AI.

A user will paste a personal message, email, or chat log. Your task is to:

1. Detect signs of dishonesty, manipulation, evasion, or gaslighting.
2. Highlight suspicious phrases.
3. Provide short reasoning for each flag.
4. Give a final verdict:
   - "🟥 Likely Dishonest"
   - "🟨 Unclear / Mixed"
   - "🟩 Likely Honest"

Avoid being overly dramatic. Keep it short, Gen Z-friendly, and a little sarcastic if the tone fits. Format your response like this:

🧠 Analysis:
- "I was busy" → 🚩 Might be an excuse, vague wording.
- "You always overthink" → 🚩 Could be manipulative gaslighting.

📊 Verdict: 🟥 Likely Dishonest`,
        feedback: feedback,
      });

      toast({
        title: 'Prompt Improved',
        description: result.reasoning,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Improve Prompt',
        description: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsImprovingPrompt(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <h4 className="font-semibold">Settings</h4>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>AI Feedback</SidebarGroupLabel>
              <SidebarSeparator />
              <Textarea
                placeholder="Give feedback to improve the AI"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-secondary border-input rounded-md focus-visible:ring-ring focus-visible:ring-offset-background"
              />
              <Button
                onClick={handleImprovePrompt}
                disabled={isImprovingPrompt || !feedback.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md mt-2"
              >
                {isImprovingPrompt ? (
                  <>
                    Improving Prompt...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Improve Prompt'
                )}
              </Button>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground">Powered by Firebase Studio</p>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col items-center justify-center min-h-screen py-12 flex-grow">
          <TextAnalyzer userText={inputText} history={conversationHistory} />
        </div>
      </div>
    </SidebarProvider>
  );
}
