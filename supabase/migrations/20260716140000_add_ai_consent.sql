-- Tracks when a user explicitly agreed to third-party AI data sharing
-- (Groq for AI/voice processing, Firecrawl for LinkedIn scraping).
-- Required by Apple App Review guideline 5.1.1(i)/5.1.2(i) - permission
-- must be obtained before any personal data is sent to a third-party AI
-- service, not just disclosed in the privacy policy.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_consent_at timestamptz;
