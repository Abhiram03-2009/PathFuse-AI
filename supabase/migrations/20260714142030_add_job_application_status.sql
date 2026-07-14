-- Application status pipeline for saved jobs, shown in the Library.
ALTER TABLE public.saved_jobs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'saved';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'saved_jobs_status_check'
  ) THEN
    ALTER TABLE public.saved_jobs
      ADD CONSTRAINT saved_jobs_status_check
      CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'rejected'));
  END IF;
END $$;
