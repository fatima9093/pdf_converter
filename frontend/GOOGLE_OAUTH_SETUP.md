# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your PDF Converter application.

## Prerequisites

✅ **Frontend Dependencies** (Already installed):
- `@react-oauth/google` - For Google Sign-In button and ID token handling

✅ **Backend Dependencies** (Already installed):
- `google-auth-library` - For verifying Google ID tokens
- `jsonwebtoken` - For creating JWT tokens for user sessions
- `dotenv` - For loading environment variables
- `cors` - For allowing frontend-backend communication

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google Identity API

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add these to **Authorized JavaScript origins**:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
5. Add these to **Authorized redirect URIs**:
   - `http://localhost:3000` (for development)
   - Your production domain (for production)
6. Save and copy the **Client ID**

## Step 3: Environment Variables Setup

### Frontend (.env.local)
Create a `.env.local` file in your project root:
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### Backend (backend/.env)
Add to your `backend/.env` file:
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 4: Implementation Status

✅ **Frontend Implementation**:
- Google OAuth Provider wrapper in `ClientLayout.tsx`
- Google Login button in login page (`/login`)
- Google Login button in signup page (`/signup`)
- Authentication context with `googleLogin` method

✅ **Backend Implementation**:
- Google Auth service in `backend/src/lib/googleAuth.ts`
- Google OAuth route at `POST /api/auth/google`
- Token verification and user creation/login logic
- JWT token generation and HTTP-only cookie setup

## Step 5: How It Works

### Login/Signup Flow:
1. User clicks "Continue with Google" button
2. Google OAuth popup opens
3. User authenticates with Google
4. Google returns an ID token to the frontend
5. Frontend sends the ID token to backend `/api/auth/google`
6. Backend verifies the token with Google
7. Backend creates/finds user and generates JWT tokens
8. Backend sets HTTP-only cookies with access/refresh tokens
9. User is redirected based on their role (Admin → `/dashboard`, User → `/`)

### User Data Handling:
- If user doesn't exist: Creates new user with Google profile data
- If user exists: Links Google account to existing user
- Admin detection: Based on predefined email list in backend
- Session management: Uses HTTP-only cookies for security

## Step 6: Testing

1. Start your backend server: `cd backend && npm run dev`
2. Start your frontend: `npm run dev`
3. Go to `http://localhost:3000/login` or `http://localhost:3000/signup`
4. Click "Continue with Google"
5. Authenticate with your Google account
6. Check that you're redirected and logged in successfully

## Security Features

- **HTTP-only cookies**: Tokens stored in secure cookies, not localStorage
- **Token verification**: Google ID tokens verified server-side
- **CORS protection**: Configured to allow only your frontend domain
- **Rate limiting**: Protection against brute force attacks
- **Role-based access**: Admin/User role management

## Troubleshooting

### Common Issues:

1. **"NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set"**
   - Make sure you've added the environment variable to `.env.local`
   - Restart your development server after adding env vars

2. **"Google OAuth client not initialized"**
   - Check that `GOOGLE_CLIENT_ID` is set in `backend/.env`
   - Verify the client ID is correct

3. **CORS errors**
   - Ensure your frontend URL is added to Google Cloud Console authorized origins
   - Check backend CORS configuration allows your frontend domain

4. **Token verification fails**
   - Verify the Google Client ID matches in both frontend and backend
   - Check that the Google Cloud project has the correct APIs enabled

## Production Deployment

When deploying to production:

1. Update Google Cloud Console with your production domains
2. Set environment variables in your hosting platform
3. Use HTTPS for all OAuth redirects
4. Update CORS configuration with production URLs

## Need Help?

- Check the browser console for error messages
- Verify all environment variables are set correctly
- Test with a simple Google account first
- Check Google Cloud Console for API quotas and limits
