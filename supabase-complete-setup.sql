-- ============================================
-- PIXIVLOADER COMPLETE DATABASE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

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

-- Enable Row Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create RLS policies for profiles
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
-- 2. CREATE DOWNLOAD HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS download_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  items_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_download_history_user_id ON download_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_created_at ON download_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE download_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own download history" ON download_history;
DROP POLICY IF EXISTS "Users can insert their own download history" ON download_history;
DROP POLICY IF EXISTS "Users can update their own download history" ON download_history;
DROP POLICY IF EXISTS "Users can delete their own download history" ON download_history;

-- Create RLS policies for download_history
CREATE POLICY "Users can view their own download history"
  ON download_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own download history"
  ON download_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own download history"
  ON download_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own download history"
  ON download_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CREATE TRIGGERS
-- ============================================

-- Function to handle new user signup (creates profile automatically)
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

-- Function to automatically update updated_at timestamp for profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;

-- Create trigger to automatically update updated_at for profiles
CREATE TRIGGER update_profiles_updated_at_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Function to automatically update updated_at timestamp for download_history
CREATE OR REPLACE FUNCTION update_download_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_download_history_updated_at_trigger ON download_history;

-- Create trigger to automatically update updated_at for download_history
CREATE TRIGGER update_download_history_updated_at_trigger
  BEFORE UPDATE ON download_history
  FOR EACH ROW
  EXECUTE FUNCTION update_download_history_updated_at();

-- ============================================
-- 4. CREATE USER DELETION FUNCTION
-- ============================================

-- Function to delete user (called from app)
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  -- Delete user from auth.users (cascade will handle profiles and download_history)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CREATE STORAGE BUCKET FOR AVATARS
-- ============================================

-- Create avatars bucket (public for avatar images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================
-- 6. CREATE STORAGE POLICIES
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
-- 7. CREATE PROFILES FOR EXISTING USERS
-- ============================================

-- Insert profiles for existing users who don't have one
INSERT INTO profiles (id, display_name, avatar_url)
SELECT id, NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these queries to verify the setup was successful:

-- 1. Check if profiles table exists and has data
-- SELECT COUNT(*) as profile_count FROM profiles;

-- 2. Check if download_history table exists
-- SELECT COUNT(*) as history_count FROM download_history;

-- 3. Check if storage bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'avatars';

-- 4. Check if policies are active for profiles
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 5. Check if policies are active for download_history
-- SELECT * FROM pg_policies WHERE tablename = 'download_history';

-- 6. Check if triggers exist
-- SELECT * FROM pg_trigger WHERE tgname IN ('on_auth_user_created', 'update_profiles_updated_at_trigger', 'update_download_history_updated_at_trigger');

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

-- Uncomment and run these commands if you need to rollback:

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
-- DROP TRIGGER IF EXISTS update_download_history_updated_at_trigger ON download_history;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS update_profiles_updated_at();
-- DROP FUNCTION IF EXISTS update_download_history_updated_at();
-- DROP FUNCTION IF EXISTS delete_user();
-- DROP TABLE IF EXISTS download_history CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DELETE FROM storage.buckets WHERE id = 'avatars';

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Success! Your Pixivloader database is now set up with:
-- ✅ Profiles table for user information
-- ✅ Download history table for tracking downloads
-- ✅ Avatar storage bucket
-- ✅ Row Level Security policies
-- ✅ Automatic profile creation for new users
-- ✅ Automatic timestamp updates
-- ✅ User deletion function

-- You can now:
-- 1. Create user accounts
-- 2. Update profiles with display names and avatars
-- 3. Track download history
-- 4. Clear download history
-- 5. Delete user accounts
