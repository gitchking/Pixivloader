-- Supabase Migration Script for Profile Management Feature
-- Run this in your Supabase SQL Editor
-- This script is idempotent and safe to run multiple times

-- ============================================
-- 1. CREATE PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. CREATE TRIGGER FOR NEW USER SIGNUP
-- ============================================

-- Create or replace function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NULL, NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. CREATE PROFILES FOR EXISTING USERS
-- ============================================

-- Insert profiles for existing users who don't have one
INSERT INTO profiles (id, display_name, avatar_url)
SELECT id, NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CREATE DELETE USER FUNCTION
-- ============================================

-- Create function to delete user (called from app)
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  -- Delete user from auth.users (cascade will handle profiles and other data)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. CREATE STORAGE BUCKET FOR AVATARS
-- ============================================

-- Create avatars bucket (public for avatar images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 7. CREATE STORAGE POLICIES
-- ============================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- 8. CREATE UPDATED_AT TRIGGER
-- ============================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the migration was successful:

-- 1. Check if profiles table exists and has data
-- SELECT COUNT(*) as profile_count FROM profiles;

-- 2. Check if storage bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 3. Check if policies are active
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 4. Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- Uncomment and run these commands if you need to rollback:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS update_profiles_updated_at();
-- DROP FUNCTION IF EXISTS delete_user();
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DELETE FROM storage.buckets WHERE id = 'avatars';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Success! The profile management feature is now set up.
-- Users can now:
-- - Update their display name
-- - Upload profile avatars
-- - Delete their account
-- - View their profile information
