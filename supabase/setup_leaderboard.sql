-- Supabase setup for public leaderboard
-- Run this in Supabase SQL editor or via supabase CLI

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id text PRIMARY KEY,
  username text NOT NULL,
  avatar text DEFAULT '',
  score integer NOT NULL,
  date date NOT NULL
);

-- Enable Row Level Security (optional if you want fine-grained control)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to select all rows
CREATE POLICY "Public select leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

-- Allow public (anon) to insert new scores
CREATE POLICY "Public insert leaderboard" ON public.leaderboard
  FOR INSERT WITH CHECK (true);

-- Optionally limit excessive inserts, e.g., prevent duplicate id's (id is primary key)
-- You may also want to add rate-limiting or server-side validation using functions.

-- Grant explicit privileges (not strictly necessary with policies, but safe):
GRANT SELECT, INSERT ON public.leaderboard TO anon;

-- To remove public write access later, revoke or adjust policies appropriately.
