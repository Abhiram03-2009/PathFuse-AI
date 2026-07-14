import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, User, Bot, Loader2, RotateCcw, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { useCachedState } from '@/hooks/useCachedState';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const MockInterview = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [stage, setStage] = useCachedState<'setup' | 'interviewing' | 'finished'>('mi:stage', 'setup');
  const [jobRole, setJobRole] = useCachedState<string>('mi:role', '');
  const [interviewType, setInterviewType] = useCachedState<string>('mi:type', 'mixed behavioral and technical');
  const [messages, setMessages] = useCachedState<Message[]>('mi:messages', []);
  const [summary, setSummary] = useCachedState<string>('mi:summary', '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Interview questions are meant to be spoken like a real interviewer -
    // the prompt already avoids markdown, but strip anything that slips through.
    const clean = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const callInterviewer = async (message: string, history: Message[]) => {
    const { data, error } = await supabase.functions.invoke('chat-gpt', {
      body: { message, history, mode: 'interview', role: jobRole, interviewType },
    });
    if (error) throw new Error(error.message || 'Failed to reach the interviewer');
    if (!data?.reply) throw new Error('No response received');
    return data.reply as string;
  };

  const startInterview = async () => {
    if (!jobRole.trim()) {
      toast({ title: 'Enter a role first', description: 'What position are you interviewing for?', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const reply = await callInterviewer("Let's begin the interview.", []);
      setMessages([{ role: 'assistant', content: reply }]);
      setStage('interviewing');
      speak(reply);
    } catch (e: any) {
      toast({ title: 'Could not start interview', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    const answer = input.trim();
    if (!answer || loading) return;
    const nextMessages: Message[] = [...messages, { role: 'user', content: answer }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const reply = await callInterviewer(answer, messages);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    window.speechSynthesis?.cancel();
    setLoading(true);
    try {
      const reply = await callInterviewer(
        "That's the end of the interview. Give me an overall performance summary: strengths, areas to improve, and 2-3 concrete tips for my next real interview.",
        messages
      );
      setSummary(reply);
      setStage('finished');
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetInterview = () => {
    window.speechSynthesis?.cancel();
    setMessages([]);
    setSummary('');
    setStage('setup');
  };

  const cardCls = isDarkMode
    ? 'bg-gray-800/40 border-cyan-400/20'
    : 'bg-white/70 border-blue-300/40';

  return (
    <div className="space-y-6">
      <Card className={`${cardCls} backdrop-blur-lg border neon-border animate-fade-in`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <Bot className="w-5 h-5" /><span>Mock Interview</span>
          </CardTitle>
          <CardDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            Practice with an AI interviewer that asks role-specific questions out loud and gives feedback on your answers.
          </CardDescription>
        </CardHeader>
      </Card>

      {stage === 'setup' && (
        <Card className={`${cardCls} backdrop-blur-lg border neon-border`}>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Role you're interviewing for</Label>
              <Input
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Product Manager"
                className={isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50'}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Interview type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger className={isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50'}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed behavioral and technical">Mixed (behavioral + technical)</SelectItem>
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {voiceEnabled ? <Mic className="w-4 h-4 text-cyan-400" /> : <MicOff className="w-4 h-4" />}
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>
            </div>
            <Button onClick={startInterview} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting…</> : 'Start Mock Interview'}
            </Button>
          </CardContent>
        </Card>
      )}

      {stage === 'interviewing' && (
        <Card className={`${cardCls} backdrop-blur-lg border neon-border`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{jobRole}</CardTitle>
              <Badge variant="secondary" className="mt-1">{interviewType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setVoiceEnabled((v) => !v)}>
                {voiceEnabled ? <Mic className="w-4 h-4 text-cyan-400" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={endInterview} disabled={loading}>
                <Flag className="w-3 h-3 mr-2" />End Interview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={scrollRef} className={`h-96 overflow-y-auto space-y-4 mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-50'}`}>
              {messages.map((m, i) => (
                <div key={i} className={`flex items-start space-x-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] sm:max-w-md min-w-0 px-4 py-2 rounded-lg ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : `${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  </div>
                  {m.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>The interviewer is thinking…</p>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer…"
                onKeyDown={(e) => e.key === 'Enter' && sendAnswer()}
                disabled={loading}
                className={isDarkMode ? 'bg-gray-900/50 border-cyan-400/30 text-white' : 'bg-white border-blue-300/50'}
              />
              <Button onClick={sendAnswer} disabled={loading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {stage === 'finished' && (
        <Card className={`${cardCls} backdrop-blur-lg border neon-border`}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : 'text-gray-900'}>Interview Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg whitespace-pre-wrap text-sm ${isDarkMode ? 'bg-gray-900/40 text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
              {summary}
            </div>
            <Button onClick={resetInterview} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />Start Another Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MockInterview;
