-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT DEFAULT 'intermediate' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_experience table
CREATE TABLE public.work_experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  client_feedback TEXT,
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  media_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience ENABLE ROW LEVEL SECURITY;

-- Skills policies
CREATE POLICY "Anyone can view skills" 
ON public.skills 
FOR SELECT 
USING (true);

CREATE POLICY "Provider owners can manage their skills" 
ON public.skills 
FOR ALL 
USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Work experience policies  
CREATE POLICY "Anyone can view work experience" 
ON public.work_experience 
FOR SELECT 
USING (true);

CREATE POLICY "Provider owners can manage their work experience" 
ON public.work_experience 
FOR ALL 
USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_skills_updated_at
BEFORE UPDATE ON public.skills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_experience_updated_at
BEFORE UPDATE ON public.work_experience
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_skills_provider_id ON public.skills(provider_id);
CREATE INDEX idx_work_experience_provider_id ON public.work_experience(provider_id);
CREATE INDEX idx_work_experience_dates ON public.work_experience(start_date, end_date);