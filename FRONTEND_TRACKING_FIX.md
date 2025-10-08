# Frontend Conversion Tracking Fix

## Problem
Frontend-handled tools (Split PDF, Compress PDF, Merge PDF, Image to PDF) were **NOT updating** the `totalConversions` for authenticated users in production, while backend-handled tools (Word to PDF, PDF to Word, etc.) were working correctly.

## Root Cause
The `trackConversion` function in `frontend/src/app/api/convert/route.ts` was making API calls to the backend's `/api/track-conversion` endpoint **WITHOUT sending authentication cookies**. 

Without cookies, the backend couldn't identify who the authenticated user was, so all frontend conversions were being tracked as anonymous users.

## Solution Applied

### Changes Made to `frontend/src/app/api/convert/route.ts`

#### 1. Updated `trackConversion` function signature
**Added `request` parameter** to receive the original Next.js request with cookies:

```typescript
async function trackConversion(params: {
  toolType: string;
  originalFileName: string;
  convertedFileName?: string;
  fileSize: number;
  userId?: string;
  status?: 'COMPLETED' | 'FAILED';
  request?: NextRequest; // ✅ NEW: Original request to forward cookies
}): Promise<void>
```

#### 2. Forward cookies to backend
**Extract and forward cookies** from the original request to the backend:

```typescript
// Get cookies from original request to forward to backend
const cookieHeader = params.request?.headers.get('cookie');

const response = await fetch(`${backendUrl}/api/track-conversion`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(cookieHeader ? { 'Cookie': cookieHeader } : {}) // ✅ Forward cookies
  },
  body: JSON.stringify({...})
});
```

#### 3. Updated all 14 tracking calls
Added `request` parameter to every `trackConversion` call in the file:

**Tools affected:**
- ✅ Merge PDF (line ~136)
- ✅ Split PDF (line ~210)
- ✅ Compress PDF (line ~241)
- ✅ Image to PDF (line ~255)
- ✅ Word to PDF - success (line ~272)
- ✅ Word to PDF - failure (line ~284)
- ✅ HTML to PDF - success (line ~310)
- ✅ HTML to PDF - failure (line ~322)
- ✅ PDF to JPG - success (line ~358)
- ✅ PDF to JPG - failure (line ~388)
- ✅ PDF to Word - success (line ~414)
- ✅ PDF to Word - failure (line ~434)
- ✅ Fallback tracking (line ~467)
- ✅ Error tracking (line ~491)

#### 4. Added logging for debugging
```typescript
console.log(`🔄 Tracking conversion to: ${backendUrl}/api/track-conversion`, {
  toolType: params.toolType,
  userId: params.userId,
  hasCookies: !!cookieHeader, // ✅ NEW: Shows if cookies are present
  status: params.status || 'COMPLETED'
});
```

## How It Works Now

### Before (Broken) ❌
```
User logs in → Performs frontend conversion (Split/Compress/Merge/Image-to-PDF) →
Frontend calls backend tracking WITHOUT cookies →
Backend can't identify user →
Tracks as anonymous (userId: null) →
totalConversions stays at 0
```

### After (Fixed) ✅
```
User logs in → Cookie stored → Performs frontend conversion →
Frontend forwards cookies to backend tracking →
Backend authenticates user from cookie →
Tracks with actual userId →
totalConversions increments! 🎉
```

## Testing Steps

### 1. Deploy Changes
```bash
git add frontend/src/app/api/convert/route.ts
git commit -m "fix: Forward cookies for frontend conversion tracking"
git push
```

### 2. Test Frontend Tools
Log in and test each frontend-handled tool:
- ✅ Split PDF
- ✅ Compress PDF
- ✅ Merge PDF
- ✅ Image to PDF

After each conversion, check:
1. Backend logs show: `✅ Tracked backend conversion: [tool] for authenticated user`
2. User Management dashboard shows incremented totalConversions
3. Database shows updated count:
   ```sql
   SELECT email, total_conversions FROM users WHERE email = 'test@example.com';
   ```

### 3. Check Backend Logs
You should see in Railway backend logs:
```
🔄 Tracking conversion to: https://your-backend.up.railway.app/api/track-conversion
   { toolType: 'compress-pdf', userId: 'clx...', hasCookies: true, status: 'COMPLETED' }
✅ Tracked backend conversion: compress-pdf for authenticated user
```

The key indicator is `hasCookies: true` - this means cookies are being forwarded!

### 4. Verify in Database
```sql
-- Check recent conversions
SELECT 
  c.id,
  c."tool_type",
  c."is_authenticated",
  c."user_id",
  u.email,
  c."created_at"
FROM conversions c
LEFT JOIN users u ON c."user_id" = u.id
WHERE c."processing_location" = 'FRONTEND'
ORDER BY c."created_at" DESC
LIMIT 10;

-- Check user totals
SELECT 
  email,
  "total_conversions",
  "last_login"
FROM users
WHERE "total_conversions" > 0
ORDER BY "total_conversions" DESC;
```

## What's Now Working

✅ **Frontend Tools (Split, Compress, Merge, Image-to-PDF):**
- Tracked with user ID when authenticated
- Updates totalConversions in database
- Creates conversion records with `processing_location: 'FRONTEND'`

✅ **Backend Tools (Word-to-PDF, PDF-to-Word, PDF-to-JPG):**
- Already working (from previous fix)
- Continues to work with optional authentication

✅ **Both authenticated and anonymous users:**
- Authenticated: Tracked with userId, increments totalConversions
- Anonymous: Tracked without userId, no increment

## Troubleshooting

### Issue: Still showing `hasCookies: false` in logs

**Cause:** Cookies aren't being sent from the client to Next.js API route.

**Solution:** Check that the conversion request from the frontend includes credentials:
```typescript
// In your frontend code that calls the conversion API
const response = await fetch('/api/convert', {
  method: 'POST',
  credentials: 'include', // Must be set!
  body: formData
});
```

### Issue: Backend logs show "Optional auth: Invalid token"

**Cause:** Cookie might be expired or malformed.

**Solution:**
1. Log out and log back in to get fresh cookies
2. Check cookie expiration settings in backend
3. Verify JWT_ACCESS_SECRET is the same on backend

### Issue: CORS errors when calling backend

**Cause:** Backend CORS not configured to allow credentials.

**Solution:** Verify `backend/src/server.ts` has:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // CRITICAL!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));
```

## Summary

**Before:** Frontend tools → No cookies → Backend tracks as anonymous → totalConversions = 0

**After:** Frontend tools → Forward cookies → Backend authenticates user → totalConversions increments!

All 14 tracking calls now properly forward authentication cookies to the backend, enabling authenticated user tracking for all conversion types. 🚀
