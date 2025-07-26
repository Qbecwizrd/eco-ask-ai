import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Globe, FileText, Plus, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Configure your FastAPI backend URL
const API_BASE_URL = 'https://weather-cimate-agent.onrender.com';

interface QuestionHistory {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

const ClimateResearchAssistant = () => {
  // Ask Question State
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);
  const [askLoading, setAskLoading] = useState(false);

  // URL Ingestion State
  const [urls, setUrls] = useState(['']);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState('');

  // Summary State
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Ask Question Handler
  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      });
      return;
    }

    setAskLoading(true);
    setCurrentAnswer('');

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        query: question
      });

      const answer = response.data;
      setCurrentAnswer(answer);

      // Add to history
      const newEntry: QuestionHistory = {
        id: Date.now().toString(),
        question,
        answer,
        timestamp: new Date()
      };
      setQuestionHistory(prev => [newEntry, ...prev]);

      toast({
        title: "Success",
        description: "Question answered successfully"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to get answer';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setAskLoading(false);
    }
  };

  // URL Management
  const addUrlField = () => {
    setUrls([...urls, '']);
  };

  const removeUrlField = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  // URL Ingestion Handler
  const handleIngestUrls = async () => {
    const validUrls = urls.filter(url => url.trim()).map(url => url.trim().replace(/["\\]/g, ''));
    
    if (validUrls.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one URL",
        variant: "destructive"
      });
      return;
    }

    setIngestLoading(true);
    setIngestResult('');

    try {
      console.log('Sending URLs:', validUrls);
      const response = await axios.post(`${API_BASE_URL}/ingest`, {
        urls: validUrls
      });

      setIngestResult(response.data);
      toast({
        title: "Success",
        description: "URLs ingested successfully"
      });
    } catch (error: any) {
      console.error('Ingest error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to ingest URLs';
      setIngestResult(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIngestLoading(false);
    }
  };

  // Summary Handler
  const handleGetSummary = async () => {
    setSummaryLoading(true);
    setSummary('');

    try {
      const response = await axios.get(`${API_BASE_URL}/summary`);
      setSummary(JSON.stringify(response.data, null, 2));
      toast({
        title: "Success",
        description: "Summary retrieved successfully"
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to get summary';
      setSummary(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-sky p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-ocean bg-clip-text text-transparent">
            Climate Research Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ask questions, ingest climate data, and get comprehensive summaries powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Ask Question Section */}
            <Card className="bg-gradient-card shadow-soft border-0 animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Send className="w-5 h-5 text-primary" />
                  Ask a Climate Question
                </CardTitle>
                <CardDescription>
                  Get AI-powered answers to your climate research questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="What are the recent impacts of El Niño on global weather patterns?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[100px] bg-background/50 border-border focus:border-primary transition-all duration-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAskQuestion();
                    }
                  }}
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={askLoading || !question.trim()}
                  className="w-full bg-gradient-ocean hover:opacity-90 transition-all duration-300 shadow-soft"
                >
                  {askLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Getting Answer...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask Question (Ctrl+Enter)
                    </>
                  )}
                </Button>

                {/* Current Answer */}
                {currentAnswer && (
                  <div className="mt-6 p-4 bg-accent/20 rounded-lg border animate-fade-in">
                    <h4 className="font-semibold mb-2 text-accent-foreground">Answer:</h4>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* URL Ingestion Section */}
            <Card className="bg-gradient-card shadow-soft border-0 animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Globe className="w-5 h-5 text-primary" />
                  Ingest URLs
                </CardTitle>
                <CardDescription>
                  Add climate-related URLs to expand the knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://climate.org/article"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      className="bg-background/50 border-border focus:border-primary transition-all duration-300"
                    />
                    {urls.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeUrlField(index)}
                        className="shrink-0 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addUrlField}
                    className="flex-1 border-dashed hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another URL
                  </Button>
                  <Button
                    onClick={handleIngestUrls}
                    disabled={ingestLoading}
                    className="flex-1 bg-gradient-ocean hover:opacity-90 transition-all duration-300 shadow-soft"
                  >
                    {ingestLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ingesting...
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        Ingest URLs
                      </>
                    )}
                  </Button>
                </div>

                {/* Ingestion Result */}
                {ingestResult && (
                  <div className={`mt-4 p-4 rounded-lg border animate-fade-in ${
                    ingestResult.startsWith('Error') 
                      ? 'bg-destructive/10 border-destructive text-destructive' 
                      : 'bg-accent/20 border-accent text-accent-foreground'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{ingestResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Daily Summary Section */}
            <Card className="bg-gradient-card shadow-soft border-0 animate-slide-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="w-5 h-5 text-primary" />
                  Daily Summary
                </CardTitle>
                <CardDescription>
                  Get a comprehensive summary of the most relevant climate content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGetSummary}
                  disabled={summaryLoading}
                  className="w-full bg-gradient-ocean hover:opacity-90 transition-all duration-300 shadow-soft"
                >
                  {summaryLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading Summary...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Get Daily Summary
                    </>
                  )}
                </Button>

                {/* Summary Display */}
                {summary && (
                  <div className={`mt-4 p-4 rounded-lg border animate-fade-in ${
                    summary.startsWith('Error') 
                      ? 'bg-destructive/10 border-destructive text-destructive' 
                      : 'bg-accent/20 border-accent text-accent-foreground'
                  }`}>
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Question History */}
            {questionHistory.length > 0 && (
              <Card className="bg-gradient-card shadow-soft border-0 animate-slide-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Clock className="w-5 h-5 text-primary" />
                    Question History
                  </CardTitle>
                  <CardDescription>
                    Your recent climate research questions and answers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto space-y-4">
                    {questionHistory.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-background/30 rounded-lg border border-border animate-fade-in"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-sm text-foreground line-clamp-2">
                            {item.question}
                          </h5>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground animate-fade-in">
          <p>Connected to FastAPI backend at <code className="bg-muted px-2 py-1 rounded">weather-cimate-agent.onrender.com</code></p>
        </div>
      </div>
    </div>
  );
};

export default ClimateResearchAssistant;