import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Briefcase, ExternalLink, Trash2, Calendar,
  FileText, Mail, Linkedin, Target,
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

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your saved items…</p>
        </CardContent>
      </Card>
    );
  }

  const Empty = ({ icon: Icon, label }: any) => (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-8 text-center">
        <Icon className="w-14 h-14 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-300">No {label} saved yet.</p>
      </CardContent>
    </Card>
  );

  const Stamp = ({ d }: { d: string }) => (
    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
      <Calendar className="w-3 h-3 mr-1" />{new Date(d).toLocaleDateString()}
    </div>
  );

  const TileShell = ({ children, onRemove }: any) => (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">{children}</div>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${isDarkMode ? 'dark' : ''}`}>
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5" /><span>Your Library</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Everything you've generated or saved — jobs, colleges, resumes, cover letters, LinkedIn reports, and keyword analyses.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white dark:bg-gray-800">
          <TabsTrigger value="jobs"><Briefcase className="w-4 h-4 mr-1" />Jobs ({data.saved_jobs.length})</TabsTrigger>
          <TabsTrigger value="colleges"><BookOpen className="w-4 h-4 mr-1" />Colleges ({data.saved_colleges.length})</TabsTrigger>
          <TabsTrigger value="resumes"><FileText className="w-4 h-4 mr-1" />Resumes ({data.saved_resumes.length})</TabsTrigger>
          <TabsTrigger value="letters"><Mail className="w-4 h-4 mr-1" />Letters ({data.saved_cover_letters.length})</TabsTrigger>
          <TabsTrigger value="linkedin"><Linkedin className="w-4 h-4 mr-1" />LinkedIn ({data.saved_linkedin_reports.length})</TabsTrigger>
          <TabsTrigger value="keywords"><Target className="w-4 h-4 mr-1" />Keywords ({data.saved_keyword_analyses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          {data.saved_jobs.length === 0 ? <Empty icon={Briefcase} label="jobs" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.saved_jobs.map((j) => (
                <TileShell key={j.id} onRemove={() => remove('saved_jobs', j.id)}>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{j.job_title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{j.company_name}</p>
                  {j.match_percentage && <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{j.match_percentage}% Match</Badge>}
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
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{c.college_name}</h3>
                  {c.match_percentage && <Badge className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{c.match_percentage}% Match</Badge>}
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
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{r.title || 'Untitled Resume'}</h3>
                  {r.template && <Badge variant="secondary" className="mt-1">{r.template}</Badge>}
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 mt-2 max-h-32 overflow-hidden">{(r.content || '').slice(0, 280)}…</pre>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{l.job_title || 'Cover Letter'}</h3>
                  {l.company && <p className="text-sm text-gray-600 dark:text-gray-300">{l.company}</p>}
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 mt-2 max-h-32 overflow-hidden">{(l.content || '').slice(0, 280)}…</pre>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{r.profile_name || 'Profile'}</h3>
                  <Badge variant="secondary" className="mt-1">{r.report_type}</Badge>
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 dark:text-gray-400 mt-2 max-h-32 overflow-hidden">{(r.content || '').slice(0, 280)}…</pre>
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
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{k.job_title || 'Job description'}</h3>
                  <Badge className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">{Math.round(k.overall_match || 0)}% Match</Badge>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {(k.missing_keywords as string[] | null)?.slice(0, 5).join(', ') || 'No missing keywords'}
                  </p>
                  <Stamp d={k.created_at} />
                </TileShell>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedItems;
