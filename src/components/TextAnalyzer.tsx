'use client';

import React, { useState } from 'react';
import { analyzeText } from '@/ai/flows/analyze-text-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TextAnalyzerProps {
  userText: string;
  history: any[]; // Replace 'any' with the appropriate type for your history
}

interface AnalysisResult {
  analysis?: string;
  verdict?: string;
  clarifyingQuestion?: string;
}

const TextAnalyzer: React.FC<TextAnalyzerProps> = ({ userText, history }) => {
  const [result, setResult] = useState<AnalysisResult>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysisResult = await analyzeText({ userText, history });
      setResult(analysisResult);
    } catch (err) {
      setError(`AI analysis failed: ${(err as any).message}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (userText) {
      handleAnalyze();
    } else {
      setLoading(false); // Set loading to false if there's no initial text
    }
  }, [userText, history]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Analyzing...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            {result.analysis && <p><strong>Analysis:</strong> {result.analysis}</p>}
            {result.verdict && <p><strong>Verdict:</strong> {result.verdict}</p>}
            {result.clarifyingQuestion && <p><strong>Clarifying Question:</strong> {result.clarifyingQuestion}</p>}
            {(!result.analysis && !result.verdict && !result.clarifyingQuestion) && <p>No analysis available.</p>}
          </>
        )}
        {!userText && <p>Please provide text for analysis.</p>}
      </CardContent>
    </Card>
  );
};

export default TextAnalyzer;