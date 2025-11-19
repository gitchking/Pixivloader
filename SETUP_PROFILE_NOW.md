# Quick Profile Setup Guide

Follow these steps to enable the profile management feature.

## Step 1: Run the Migration Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase-migration.sql`
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

## Step 2: Verify the Setup

Run these verification queries in the SQL Editor:

### Check if profiles table exists:
```sql
SELECT COUNT(*) as profile_count FROM profiles;
```

### Check if avatars bucket exists:
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```

### Check if your profile was created:
```sql
SELECT * FROM profiles;
```

## Step 3: Test the Feature

1. Refresh your application (F5)
2. You should see a profile icon with a blue border in the top-right
3. Click on it and select "Profile"
4. Try updating your display name
5. Try uploading an avatar image

## Troubleshooting

### Error: "relation 'profiles' does not exist"
**Solution**: The migration script hasn't been run. Go back to Step 1.

### Error: "Bucket not found"
**Solution**: The avatars bucket wasn't created. Run this SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Error: "new row violates row-level security policy"
**Solution**: RLS policies aren't set up correctly. Re-run the entire migration script.

### Profile doesn't load
**Solution**: Create a profile manually:
```sql
INSERT INTO profiles (id, display_name, avatar_url)
SELECT id, NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## What Gets Created

The migration script creates:

1. **profiles table** - Stores user display names and avatar URLs
2. **avatars bucket** - Storage for profile pictures
3. **RLS policies** - Security rules for profiles and avatars
4. **Triggers** - Automatically creates profiles for new users
5. **Functions** - delete_user() function for account deletion

## Need Help?

Check the browser console (F12) for detailed error messages. The ProfileDropdown component now logs all errors to help with debugging.
