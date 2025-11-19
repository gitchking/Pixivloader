# Download System Update

## Changes Made

### Backend (Python)
- **Updated `/api/download/start` endpoint**:
  - Now downloads all images on the server side
  - Creates a zip file in memory
  - Returns the zip file directly to the user
  - No more individual image proxy downloads

### Frontend (React)
- **Simplified download process**:
  - Removed progress bar (no longer needed)
  - Single zip file download instead of multiple files
  - Cleaner user experience
  - Still supports custom download location via File System Access API

### Settings Page
- **Browse button**:
  - Click "Browse" to select a custom download folder
  - Folder name is saved and displayed
  - When downloading, user will be prompted to select the folder again
  - Falls back to browser default if not supported or cancelled

## How It Works Now

1. **User enters Pixiv URL** and clicks "Start Archive"
2. **Backend processes**:
   - Scrapes the Pixiv user profile
   - Downloads all images (up to 50)
   - Creates a zip file in memory
   - Returns zip file to frontend
3. **Frontend downloads**:
   - Receives the zip file
   - If custom location is enabled, prompts user to select folder
   - Saves the zip file
   - Shows success message

## Benefits

✅ **Faster**: Single download instead of multiple
✅ **Cleaner**: One zip file instead of many individual files
✅ **Reliable**: Backend handles all the downloading
✅ **Organized**: All images in one archive
✅ **Better UX**: No progress bar spam, just one clean download

## File Structure

Downloaded zip file contains:
```
pixiv_user_123456.zip
├── 12345678_p0.jpg
├── 12345678_p1.jpg
├── 23456789_p0.png
└── ...
```

## Custom Download Location

### How to Use:
1. Go to Settings
2. Click "Browse" button
3. Select a folder (folder name will be displayed)
4. Click "Save Settings"
5. When downloading, you'll be prompted to select that folder
6. Zip file will be saved to your chosen location

### Browser Support:
- ✅ Chrome/Edge 86+
- ✅ Opera 72+
- ❌ Firefox (uses default download folder)
- ❌ Safari (uses default download folder)

### Fallback:
If custom location is not supported or user cancels, the zip file downloads to the browser's default download folder.

## API Changes

### Removed Endpoints:
- ❌ `/api/download/image` (no longer needed)

### Updated Endpoints:
- ✅ `/api/download/start` - Now returns zip file directly

## Testing

To test the new system:

1. Start the backend: `python python-backend/app.py`
2. Start the frontend: `npm run dev`
3. Login to the app
4. Enter a Pixiv user URL
5. Click "Start Archive"
6. Wait for processing (may take 30-60 seconds for 50 images)
7. Zip file will download automatically

## Notes

- Maximum 50 images per download (configurable in backend)
- Zip file is created in memory (no disk storage needed)
- Failed image downloads are logged but don't stop the process
- File names are preserved from Pixiv
