'use client';

import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

const API_ENDPOINT = '/api/analyze';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    setAnalysisResult(null); // Clear previous results
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({text: inputText}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI analysis failed: ${errorData.error}`);
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setAnalysisResult(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (analysis: string | null) => {
    if (!analysis) return null;

    if (analysis.includes('🟥 Likely Dishonest')) {
      return <Badge variant="destructive">Likely Dishonest</Badge>;
    } else if (analysis.includes('🟨 Unclear / Mixed')) {
      return <Badge>Unclear / Mixed</Badge>;
    } else if (analysis.includes('🟩 Likely Honest')) {
      return <Badge>Likely Honest</Badge>;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-12 bg-secondary">
      <Card className="w-full max-w-2xl rounded-lg shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            CapDetective 🔍
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste the message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-background border-input rounded-md focus-visible:ring-ring focus-visible:ring-offset-background"
          />
          <Button
            onClick={analyzeText}
            disabled={loading || !inputText.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </Button>
          {analysisResult && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Analysis Result:</h3>
              <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
                {analysisResult}
              </pre>
              {getVerdictBadge(analysisResult)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
