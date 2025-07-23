
-- Enable RLS on existing tables and add user authentication
ALTER TABLE saved_colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_colleges
CREATE POLICY "Users can view their own saved colleges" 
  ON saved_colleges 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved colleges" 
  ON saved_colleges 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved colleges" 
  ON saved_colleges 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved colleges" 
  ON saved_colleges 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for saved_jobs
CREATE POLICY "Users can view their own saved jobs" 
  ON saved_jobs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved jobs" 
  ON saved_jobs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved jobs" 
  ON saved_jobs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs" 
  ON saved_jobs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create user resumes table for storing uploaded resumes
CREATE TABLE public.user_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  parsed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_resumes
ALTER TABLE public.user_resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_resumes
CREATE POLICY "Users can view their own resumes" 
  ON user_resumes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes" 
  ON user_resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes" 
  ON user_resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes" 
  ON user_resumes 
  FOR DELETE 
  USING (auth.uid() = user_id);
