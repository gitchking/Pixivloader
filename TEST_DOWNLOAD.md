# Test Download Flow

## Check if backend is running:
```bash
curl http://localhost:5000/api/health
```

## Test with a small user (fewer images):
Try this URL in the frontend:
```
https://www.pixiv.net/en/users/123456
```

This user has only ~27 images, so it should be faster.

## Check browser console:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors when clicking "Start Archive"
4. Go to Network tab
5. Look for the `/api/download/zip` request
6. Check if it's pending, failed, or completed

## Backend logs:
Watch the backend terminal for:
- "Creating ZIP with X images"
- "Added 1/X: filename.jpg"
- Any error messages

## Common issues:
1. **Stuck on "Processing"**: ZIP creation is taking time (normal for many images)
2. **Network timeout**: Browser may timeout on large downloads
3. **CORS error**: Backend needs restart after code changes
4. **No response**: Check if backend is actually running on port 5000

## Quick test backend directly:
```powershell
# Test with 2 images only
$body = @{
  imageUrls = @(
    "https://i.pximg.net/img-original/img/2016/04/18/19/50/48/56416595_p0.jpg",
    "https://i.pximg.net/img-original/img/2014/08/20/17/58/10/45476165_p0.jpg"
  )
  userId = "123456"
} | ConvertTo-Json

Invoke-WebRequest -Uri 'http://localhost:5000/api/download/zip' -Method POST -Body $body -ContentType 'application/json' -OutFile 'test.zip'
```

If this works, the backend is fine and the issue is in the frontend.
