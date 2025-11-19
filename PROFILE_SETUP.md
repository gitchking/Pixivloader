# Profile Management Setup Guide

This guide explains how to set up the profile management feature with avatar uploads.

## Database Setup

### 1. Run the Migration Script

Execute the `supabase-migration.sql` file in your Supabase SQL Editor. This will create:

- `profiles` table for user profile data
- `avatars` storage bucket for profile pictures
- Automatic profile creation on user signup
- Row Level Security policies
- User deletion function

### 2. Verify Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Verify that the `avatars` bucket exists
3. Ensure it's set to **Public** (for avatar images to be accessible)

## Features Included

### Profile Dropdown Menu
- Click on the profile avatar (with blue border) in the navbar to access:
  - **Profile**: Update name, avatar, and delete account
  - **Settings**: Navigate to settings page
  - **Log out**: Sign out of the application

### Profile Dialog
- **Display Name**: Set or update your display name
- **Avatar Upload**: Upload a profile picture (supports all image formats)
- **Email Display**: Shows your registered email (read-only)
- **Danger Zone**: Delete account section at the bottom

### Avatar Display
- Shows uploaded avatar or initials fallback
- Automatically generates initials from display name or email
- Circular avatar design with blue ring border
- Smooth hover effects and transitions

## Usage

### For Users

1. **Login** to your account
2. **Click** on the profile icon (blue bordered avatar) in the top-right corner
3. **Select** "Profile" from the dropdown
4. **Update** your display name and/or upload an avatar
5. **Click** "Save Changes"

### Deleting Account

1. Click on profile icon
2. Select "Profile" from the dropdown
3. Scroll down to the "Danger Zone" section
4. Click "Delete Account" button
5. Confirm deletion in the dialog
6. All your data will be permanently removed

## Technical Details

### Profile Data Structure

```typescript
interface UserProfile {
  id: string;              // User UUID (matches auth.users.id)
  email: string;           // User email from auth
  display_name: string | null;  // Optional display name
  avatar_url: string | null;    // URL to avatar in storage
}
```

### Storage Structure

Avatars are stored in the `avatars` bucket with the following path structure:
```
avatars/
  └── {user_id}-{random}.{ext}
```

### Security

- **Row Level Security (RLS)** enabled on profiles table
- Users can only view/edit their own profile
- Avatar uploads are restricted to authenticated users
- Storage policies ensure users can only manage their own avatars

## Troubleshooting

### Avatar Upload Fails

**Issue**: Error when uploading avatar

**Solutions**:
1. Verify the `avatars` bucket exists in Supabase Storage
2. Ensure the bucket is set to **Public**
3. Check storage policies are correctly applied
4. Verify file size is under Supabase limits (default 50MB)

### Profile Not Loading

**Issue**: Profile data doesn't appear

**Solutions**:
1. Verify the `profiles` table exists
2. Check if the trigger `on_auth_user_created` is active
3. For existing users, manually insert a profile record:
```sql
INSERT INTO profiles (id) 
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);
```

### Delete Account Not Working

**Issue**: Account deletion fails

**Solutions**:
1. Verify the `delete_user()` function exists
2. Check function has `SECURITY DEFINER` attribute
3. Ensure RLS policies allow deletion
4. Check browser console for specific error messages

## Migration for Existing Users

If you already have users in your database, run this SQL to create profiles for them:

```sql
INSERT INTO profiles (id, display_name, avatar_url)
SELECT id, NULL, NULL
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

## Customization

### Change Avatar Size

Edit `src/components/ProfileDropdown.tsx`:

```typescript
// In the dropdown trigger
<Avatar className="h-10 w-10">  // Change size here

// In the profile dialog
<Avatar className="h-24 w-24">  // Change size here
```

### Add More Profile Fields

1. Add columns to `profiles` table:
```sql
ALTER TABLE profiles ADD COLUMN bio TEXT;
ALTER TABLE profiles ADD COLUMN website TEXT;
```

2. Update the `UserProfile` interface in `ProfileDropdown.tsx`
3. Add form fields in the profile dialog

### Customize Dropdown Menu Items

Edit the `DropdownMenuContent` section in `ProfileDropdown.tsx` to add/remove menu items.

## Next Steps

- Add profile page to view other users' profiles
- Implement profile picture cropping
- Add more profile fields (bio, social links, etc.)
- Add profile completion progress indicator
- Implement profile visibility settings

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify all SQL migrations ran successfully
4. Ensure environment variables are correct
