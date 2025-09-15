# Authentication System Setup Guide

## Overview
This is a production-ready authentication system built with Node.js, Express, Prisma, PostgreSQL, and includes:

- ✅ **User Types**: Admin and Normal User roles
- ✅ **Email/Password Authentication** with strong password validation
- ✅ **Google OAuth 2.0** integration
- ✅ **JWT-based authentication** (access + refresh tokens)
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Security features**: Rate limiting, CSRF protection, input validation
- ✅ **PostgreSQL database** with Prisma ORM
- ✅ **Session management** with token rotation

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id            VARCHAR PRIMARY KEY,
  name          VARCHAR NOT NULL,
  email         VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  role          ENUM('ADMIN', 'USER') DEFAULT 'USER',
  provider      ENUM('EMAIL', 'GOOGLE') DEFAULT 'EMAIL',
  google_id     VARCHAR,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id            VARCHAR PRIMARY KEY,
  user_id       VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
```bash
# Install PostgreSQL (if not installed)
# Create database
createdb pdf_converter_auth

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/pdf_converter_auth"
```

### 3. Environment Configuration
Create `.env` file in backend directory with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pdf_converter_auth"

# JWT Secrets (Generate secure keys!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-minimum-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production-minimum-32-characters"

# JWT Expiry
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth (Optional - for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Security
CSRF_SECRET="your-csrf-secret-key-change-in-production"
```

### 4. Generate Database Schema
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Create First Admin User
```bash
# Start the server
npm run dev

# Use POST /api/auth/signup to create first user, then manually update role in database:
# UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

### 6. Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - Your production domain
6. Add Client ID and Secret to `.env`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Admin Routes (Requires ADMIN role)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/role` - Update user role

### Protected Routes (Requires authentication)
- All conversion endpoints require valid JWT token

## Frontend Integration

### Environment Variables
Create `.env.local` in frontend root:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Usage Examples

#### Login
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login } = useAuth();
const result = await login(email, password);
if (result.success) {
  // Redirect to dashboard
}
```

#### Google Login
```typescript
const { googleLogin } = useAuth();
const result = await googleLogin(credentialResponse.credential);
```

#### Protected API Calls
```typescript
const accessToken = localStorage.getItem('accessToken');
const response = await fetch('/api/convert', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: formData,
});
```

## Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### JWT Security
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Automatic token rotation
- Secure token storage

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- General endpoints: 100 requests per 15 minutes

### Additional Security
- CSRF protection
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- Session cleanup

## Testing

### Create Test Users
```bash
# Admin user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@test.com","password":"Admin123!"}'

# Regular user
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"user@test.com","password":"User123!"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!"}'
```

## Production Deployment

### Security Checklist
- [ ] Change all default secrets in `.env`
- [ ] Use HTTPS in production
- [ ] Set secure database credentials
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Monitor and log authentication events
- [ ] Use environment-specific configurations

### Database Migration
```bash
# Production database setup
npm run db:migrate
```

## Troubleshooting

### Common Issues
1. **Database connection errors**: Check DATABASE_URL format
2. **JWT errors**: Ensure secrets are properly set
3. **Google OAuth errors**: Verify Client ID and redirect URIs
4. **CORS errors**: Check FRONTEND_URL in backend .env

### Debugging
- Check server logs for detailed error messages
- Verify token format and expiry
- Test API endpoints with Postman/curl
- Use Prisma Studio for database inspection: `npm run db:studio`

## Architecture

### Backend Structure
```
backend/
├── src/
│   ├── lib/
│   │   ├── auth.ts          # JWT and password utilities
│   │   ├── database.ts      # Prisma client
│   │   ├── googleAuth.ts    # Google OAuth utilities
│   │   └── validation.ts    # Input validation schemas
│   ├── middleware/
│   │   ├── auth.ts          # Authentication middleware
│   │   └── security.ts      # Security middleware
│   ├── routes/
│   │   └── auth.ts          # Authentication routes
│   └── server.ts            # Main server file
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

### Frontend Integration
- Authentication context with React hooks
- Role-based route protection
- Automatic token refresh
- Google OAuth components
- Admin and user dashboards

This authentication system provides enterprise-grade security and can be easily extended for additional features like email verification, password reset, and audit logging.


