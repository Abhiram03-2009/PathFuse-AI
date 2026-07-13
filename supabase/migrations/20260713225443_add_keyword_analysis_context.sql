-- Store the original job description and resume text alongside a keyword
-- analysis, so the Library can show more than just the match percentage
-- and missing-keyword list.
ALTER TABLE public.saved_keyword_analyses
  ADD COLUMN IF NOT EXISTS job_description text,
  ADD COLUMN IF NOT EXISTS resume_text text;
