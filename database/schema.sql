-- First drop dependent tables
DROP TABLE IF EXISTS public.focus_sessions;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.tasks;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    priority INTEGER DEFAULT 1,
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to tasks table
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Focus Sessions table
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    duration INTEGER, -- in seconds
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions" ON public.focus_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.focus_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.focus_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.focus_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Add project table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their projects" ON public.projects
    USING (auth.uid() = user_id); 