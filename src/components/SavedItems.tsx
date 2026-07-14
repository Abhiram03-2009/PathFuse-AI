import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BookOpen, Briefcase, ExternalLink, Trash2, Calendar,
  FileText, Mail, Linkedin, Target, Eye, Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

interface Row { id: string; created_at: string; [k: string]: any; }

const TABLES = [
  'saved_jobs', 'saved_colleges', 'saved_resumes',
  'saved_cover_letters', 'saved_linkedin_reports', 'saved_keyword_analyses',
] as const;
type TableName = typeof TABLES[number];

const SavedItems = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [data, setData] = useState<Record<TableName, Row[]>>({
    saved_jobs: [], saved_colleges: [], saved_resumes: [],
    saved_cover_letters: [], saved_linkedin_reports: [], saved_keyword_analyses: [],
  });
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in required', description: 'Sign in to view your saved items.', variant: 'destructive' });
        return;
      }
      const results = await Promise.all(
        TABLES.map((t) => supabase.from(t as any).select('*').eq('user_id', user.id).order('created_at', { ascending: false }))
      );
      const next: any = {};
      TABLES.forEach((t, i) => { next[t] = (results[i].data as any) || []; });
      setData(next);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load saved items.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (table: TableName, id: string) => {
    const { error } = await supabase.from(table as any).delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setData((d) => ({ ...d, [table]: d[table].filter((r) => r.id !== id) }));
    toast({ title: 'Removed', description: 'Item deleted from your saved list.' });
  };

  const JOB_STATUSES = ['saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;
  const STATUS_STYLE: Record<string, string> = {
    saved: 'bg-gray-500/20 text-gray-300 border-gray-400/30',
    applied: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    interviewing: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    offer: 'bg-green-500/20 text-green-300 border-green-400/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
  };

  const updateJobStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('saved_jobs').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    setData((d) => ({
      ...d,
      saved_jobs: d.saved_jobs.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const copyContent = async () => {
    if (!viewing) return;
    await navigator.clipboard.writeText(viewing.content);
    toast({ title: 'Copied', description: 'Content copied to clipboard.' });
  };

  const cardBg = isDarkMode
    ? 'bg-gray-800/40 border-cyan-400/20 backdrop-blur-lg neon-border'
    : 'bg-white/70 border-blue-300/40 backdrop-blur-lg neon-border';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textMuted = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <Card className={`${cardBg} border`}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto" />
          <p className={`${textSecondary} mt-4`}>Loading your saved items…</p>
        </CardContent>
      </Card>
    );
  }

  const Empty = ({ icon: Icon, label }: any) => (
    <Card className={`${cardBg} border`}>
      <CardContent className="p-8 text-center">
        <Icon className={`w-14 h-14 ${textMuted} mx-auto mb-3`} />
        <p className={textSecondary}>No {label} saved yet.</p>
      </CardContent>
    </Card>
  );

  const Stamp = ({ d }: { d: string }) => (
    <div className={`flex items-center text-xs ${textMuted} mt-2`}>
      <Calendar className="w-3 h-3 mr-1" />{new Date(d).toLocaleDateString()}
    </div>
  );

  const TileShell = ({ children, onRemove }: any) => (
    <Card className={`${cardBg} border transition-all hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">{children}</div>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-400 hover:bg-red-400/10 p-1 shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ContentPreview = ({ title, content }: { title: string; content: string }) => (
    <>
      <p className={`text-xs ${textSecondary} mt-2 line-clamp-3 whitespace-pre-wrap`}>{content}</p>
      <Button
        variant="outline"
        size="sm"
        className={`w-full mt-2 ${isDarkMode ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'}`}
        onClick={() => setViewing({ title, content })}
      >
        <Eye className="w-3 h-3 mr-2" />View full
      </Button>
    </>
  );

  return (
    <div className="space-y-6">
      <Card className={`${cardBg} border`}>
        <CardHeader>
          <CardTitle className={`flex items-center space-x-2 ${textPrimary}`}>
            <BookOpen className="w-5 h-5 text-cyan-400" /><span>Your Library</span>
          </CardTitle>
          <CardDescription className={textSecondary}>
            Everything you've generated or saved — jobs, colleges, resumes, cover letters, LinkedIn reports, and keyword analyses.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className={`flex overflow-x-auto scrollbar-hide gap-1.5 w-full ${isDarkMode ? 'bg-gray-800/40' : 'bg-white/60'} p-1 h-auto rounded-lg`}>
          <TabsTrigger value="jobs" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><Briefcase className="w-4 h-4 mr-1" />Jobs ({data.saved_jobs.length})</TabsTrigger>
          <TabsTrigger value="colleges" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><BookOpen className="w-4 h-4 mr-1" />Colleges ({data.saved_colleges.length})</TabsTrigger>
          <TabsTrigger value="resumes" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><FileText className="w-4 h-4 mr-1" />Resumes ({data.saved_resumes.length})</TabsTrigger>
          <TabsTrigger value="letters" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><Mail className="w-4 h-4 mr-1" />Letters ({data.saved_cover_letters.length})</TabsTrigger>
          <TabsTrigger value="linkedin" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><Linkedin className="w-4 h-4 mr-1" />LinkedIn ({data.saved_linkedin_reports.length})</TabsTrigger>
          <TabsTrigger value="keywords" className="flex-shrink-0 whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"><Target className="w-4 h-4 mr-1" />Keywords ({data.saved_keyword_analyses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          {data.saved_jobs.length === 0 ? <Empty icon={Briefcase} label="jobs" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.saved_jobs.map((j) => (
                <TileShell key={j.id} onRemove={() => remove('saved_jobs', j.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{j.job_title}</h3>
                  <p className={`text-sm ${textSecondary}`}>{j.company_name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {j.match_percentage && <Badge className="bg-green-500/20 text-green-300 border border-green-400/30">{j.match_percentage}% Match</Badge>}
                    <Select value={j.status || 'saved'} onValueChange={(v) => updateJobStatus(j.id, v)}>
                      <SelectTrigger className={`h-6 w-auto text-xs border ${STATUS_STYLE[j.status || 'saved']}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Stamp d={j.created_at} />
                  {j.job_url && <Button variant="outline" size="sm" asChild className="w-full mt-2"><a href={j.job_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-2" />Apply</a></Button>}
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="colleges">
          {data.saved_colleges.length === 0 ? <Empty icon={BookOpen} label="colleges" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.saved_colleges.map((c) => (
                <TileShell key={c.id} onRemove={() => remove('saved_colleges', c.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{c.college_name}</h3>
                  {c.match_percentage && <Badge className="mt-2 bg-blue-500/20 text-blue-300 border border-blue-400/30">{c.match_percentage}% Match</Badge>}
                  <Stamp d={c.created_at} />
                  {c.college_url && <Button variant="outline" size="sm" asChild className="w-full mt-2"><a href={c.college_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 mr-2" />View</a></Button>}
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resumes">
          {data.saved_resumes.length === 0 ? <Empty icon={FileText} label="resumes" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.saved_resumes.map((r) => (
                <TileShell key={r.id} onRemove={() => remove('saved_resumes', r.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{r.title || 'Untitled Resume'}</h3>
                  {r.template && <Badge variant="secondary" className="mt-1">{r.template}</Badge>}
                  <ContentPreview title={r.title || 'Untitled Resume'} content={r.content || ''} />
                  <Stamp d={r.created_at} />
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="letters">
          {data.saved_cover_letters.length === 0 ? <Empty icon={Mail} label="cover letters" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.saved_cover_letters.map((l) => (
                <TileShell key={l.id} onRemove={() => remove('saved_cover_letters', l.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{l.job_title || 'Cover Letter'}</h3>
                  {l.company && <p className={`text-sm ${textSecondary}`}>{l.company}</p>}
                  <ContentPreview title={l.job_title || 'Cover Letter'} content={l.content || ''} />
                  <Stamp d={l.created_at} />
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="linkedin">
          {data.saved_linkedin_reports.length === 0 ? <Empty icon={Linkedin} label="LinkedIn reports" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.saved_linkedin_reports.map((r) => (
                <TileShell key={r.id} onRemove={() => remove('saved_linkedin_reports', r.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{r.profile_name || 'Profile'}</h3>
                  <Badge variant="secondary" className="mt-1">{r.report_type}</Badge>
                  <ContentPreview title={r.profile_name || 'LinkedIn report'} content={r.content || ''} />
                  <Stamp d={r.created_at} />
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="keywords">
          {data.saved_keyword_analyses.length === 0 ? <Empty icon={Target} label="keyword analyses" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.saved_keyword_analyses.map((k) => (
                <TileShell key={k.id} onRemove={() => remove('saved_keyword_analyses', k.id)}>
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>{k.job_title || 'Job description'}</h3>
                  <Badge className="mt-1 bg-purple-500/20 text-purple-300 border border-purple-400/30">{Math.round(k.overall_match || 0)}% Match</Badge>
                  <p className={`text-xs ${textMuted} mt-2`}>
                    Missing: {(k.missing_keywords as string[] | null)?.slice(0, 5).join(', ') || 'none'}
                  </p>
                  {(k.job_description || k.resume_text) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full mt-2 ${isDarkMode ? 'border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10' : 'border-blue-300/50 text-blue-600 hover:bg-blue-400/10'}`}
                      onClick={() => setViewing({
                        title: k.job_title || 'Keyword analysis',
                        content: [
                          k.job_description ? `JOB DESCRIPTION\n\n${k.job_description}` : '',
                          k.resume_text ? `RESUME / EXPERIENCE\n\n${k.resume_text}` : '',
                        ].filter(Boolean).join('\n\n---\n\n'),
                      })}
                    >
                      <Eye className="w-3 h-3 mr-2" />View job description & resume
                    </Button>
                  )}
                  <Stamp d={k.created_at} />
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewing} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className={`max-w-2xl max-h-[80vh] flex flex-col ${isDarkMode ? 'bg-gray-900 border-cyan-400/30' : 'bg-white'}`}>
          <DialogHeader>
            <DialogTitle className={textPrimary}>{viewing?.title}</DialogTitle>
          </DialogHeader>
          <div className={`overflow-y-auto flex-1 whitespace-pre-wrap text-sm ${textSecondary} p-1`}>
            {viewing?.content}
          </div>
          <Button variant="outline" size="sm" onClick={copyContent} className="self-end">
            <Copy className="w-3 h-3 mr-2" />Copy to clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedItems;
