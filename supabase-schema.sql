-- FreshKeeper Database Schema
-- Run this SQL in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- Create ingredients table
CREATE TABLE IF NOT EXISTS public.ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  storage TEXT NOT NULL CHECK (storage IN ('냉장', '냉동')),
  status TEXT NOT NULL CHECK (status IN ('여유', '임박', '오늘', '초과')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS ingredients_user_id_idx ON public.ingredients(user_id);
CREATE INDEX IF NOT EXISTS ingredients_created_at_idx ON public.ingredients(created_at DESC);
CREATE INDEX IF NOT EXISTS ingredients_expiry_date_idx ON public.ingredients(expiry_date);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Policies scoped to the logged-in user (auth.uid()).
-- Drop legacy public-access policies first so this script is safe to re-run.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ingredients;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.ingredients;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.ingredients;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.ingredients;
DROP POLICY IF EXISTS "Users can view own ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Users can insert own ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Users can update own ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Users can delete own ingredients" ON public.ingredients;

CREATE POLICY "Users can view own ingredients" ON public.ingredients
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients" ON public.ingredients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredients" ON public.ingredients
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredients" ON public.ingredients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Create a function to automatically calculate status based on expiry_date
CREATE OR REPLACE FUNCTION calculate_ingredient_status(p_expiry_date DATE)
RETURNS TEXT AS $$
DECLARE
  days_diff INTEGER;
BEGIN
  days_diff := p_expiry_date - CURRENT_DATE;

  IF days_diff < 0 THEN
    RETURN '초과';
  ELSIF days_diff = 0 THEN
    RETURN '오늘';
  ELSIF days_diff <= 3 THEN
    RETURN '임박';
  ELSE
    RETURN '여유';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Optional: Create a trigger to auto-update status before insert/update
CREATE OR REPLACE FUNCTION auto_calculate_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := calculate_ingredient_status(NEW.expiry_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ingredients_auto_status
  BEFORE INSERT OR UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_status();

-- Sample data for testing (optional)
-- Uncomment to insert sample data
/*
INSERT INTO public.ingredients (name, expiry_date, storage, status) VALUES
  ('김치', CURRENT_DATE + INTERVAL '5 days', '냉장', '여유'),
  ('우유', CURRENT_DATE + INTERVAL '2 days', '냉장', '임박'),
  ('계란', CURRENT_DATE, '냉장', '오늘'),
  ('닭고기', CURRENT_DATE - INTERVAL '1 day', '냉동', '초과');
*/
