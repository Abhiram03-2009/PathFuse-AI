-- saved_resumes
CREATE TABLE public.saved_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  template text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_resumes TO authenticated;
GRANT ALL ON public.saved_resumes TO service_role;
ALTER TABLE public.saved_resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved_resumes" ON public.saved_resumes
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_saved_resumes_updated_at BEFORE UPDATE ON public.saved_resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- saved_cover_letters
CREATE TABLE public.saved_cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_title text,
  company text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_cover_letters TO authenticated;
GRANT ALL ON public.saved_cover_letters TO service_role;
ALTER TABLE public.saved_cover_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved_cover_letters" ON public.saved_cover_letters
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_saved_cover_letters_updated_at BEFORE UPDATE ON public.saved_cover_letters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- saved_linkedin_reports
CREATE TABLE public.saved_linkedin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  linkedin_url text,
  profile_name text,
  report_type text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_linkedin_reports TO authenticated;
GRANT ALL ON public.saved_linkedin_reports TO service_role;
ALTER TABLE public.saved_linkedin_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved_linkedin_reports" ON public.saved_linkedin_reports
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_saved_linkedin_reports_updated_at BEFORE UPDATE ON public.saved_linkedin_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- saved_keyword_analyses
CREATE TABLE public.saved_keyword_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_title text,
  overall_match numeric,
  matched_keywords jsonb DEFAULT '[]'::jsonb,
  missing_keywords jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_keyword_analyses TO authenticated;
GRANT ALL ON public.saved_keyword_analyses TO service_role;
ALTER TABLE public.saved_keyword_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved_keyword_analyses" ON public.saved_keyword_analyses
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_saved_keyword_analyses_updated_at BEFORE UPDATE ON public.saved_keyword_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();