'use client';

import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {useToast} from "@/hooks/use-toast"
import {useEffect} from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { improvePromptTemplate } from "@/ai/flows/improve-prompt-template";
import { Loader2 } from "lucide-react";

const API_ENDPOINT = '/api/analyze';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisVerdict, setAnalysisVerdict] = useState<string | null>(null);
  const [analysisQuestion, setAnalysisQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();
  const [feedback, setFeedback] = useState('');
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    { role: 'user' | 'assistant'; content: string }[]
  >([]);


  useEffect(() => {
    document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1505843519540-bca96959386e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundRepeat = 'no-repeat';

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
    };
  }, []);

  const analyzeText = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setAnalysisVerdict(null);
    setAnalysisQuestion(null);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText, history: conversationHistory }),
      });

      if (!response.ok) {
        try {
          const errorData = await response.json(); // Try to parse JSON error
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
          throw new Error(errorMessage);
        } catch (jsonError) {
          // If JSON parsing fails, just use the raw response text
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        }
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      setAnalysisVerdict(data.verdict);
      setAnalysisQuestion(data.clarifyingQuestion);

      // Update conversation history
      setConversationHistory(prevHistory => [
        ...prevHistory,
        { role: 'user', content: inputText },
        {
          role: 'assistant',
          content: `Analysis: ${data.analysis}\nVerdict: ${data.verdict}\nClarifying Question: ${data.clarifyingQuestion || ''}`,
        },
      ]);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAnalysisResult(`Analysis failed: ${error.message}`);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string | null) => {
    if (!verdict) return null;

    if (verdict.includes('🟥 Likely Dishonest')) {
      return <Badge variant="destructive">Likely Dishonest</Badge>;
    } else if (verdict.includes('🟨 Unclear / Mixed')) {
      return <Badge>Unclear / Mixed</Badge>;
    } else if (verdict.includes('🟩 Likely Honest')) {
      return <Badge>Likely Honest</Badge>;
    }
    return null;
  };

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

        📊 Verdict: 🟥 Likely Dishonest
        `,
        feedback: feedback,
      });

      toast({
        title: "Prompt Improved",
        description: result.reasoning,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Improve Prompt",
        description: error.message,
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              >
                {isImprovingPrompt ? (
                  <>
                    Improving Prompt...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Improve Prompt"
                )}
              </Button>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <p className="text-xs text-muted-foreground">
              Powered by Firebase Studio
            </p>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col items-center justify-start min-h-screen py-12 flex-grow">
          <Card className="w-full max-w-2xl rounded-lg shadow-md bg-card">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                LieCatcher 🕵️
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste the message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-secondary border-input rounded-md focus-visible:ring-ring focus-visible:ring-offset-background"
              />
              <Button
                onClick={analyzeText}
                disabled={loading || !inputText.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
              >
                {loading ? (
                  <>
                    Analyzing...
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Analyze"
                )}
              </Button>
              {analysisResult && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Analysis Result:</h3>
                  <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                    {analysisResult}
                  </pre>
                  {getVerdictBadge(analysisVerdict)}
                  {analysisQuestion && (
                    <>
                      <h3 className="text-lg font-semibold">Clarifying Question:</h3>
                      <p>{analysisQuestion}</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarProvider>
  );
}
