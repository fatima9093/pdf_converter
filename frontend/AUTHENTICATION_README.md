# 🔐 Professional Authentication System

A production-ready authentication system for the PDF Converter application with comprehensive security features and role-based access control.

## ✨ Features

### 🔹 User Management
- **Admin Users**: Full access to admin dashboard and user management
- **Normal Users**: Access to PDF conversion tools and personal dashboard
- **Role-based permissions** stored in PostgreSQL database
- **Multiple admin support**

### 🔹 Authentication Methods
- **Email & Password**: Secure registration and login with strong password validation
- **Google OAuth 2.0**: One-click login with Google accounts
- **Automatic account linking**: If user exists, links Google account to existing profile

### 🔹 Security Features
- **JWT-based authentication** with access and refresh tokens
- **Password security**: bcrypt hashing with strong password requirements
- **Token rotation**: Automatic refresh token rotation for enhanced security
- **Rate limiting**: Protection against brute force attacks
- **CSRF protection**: Cross-site request forgery prevention
- **Input validation**: Comprehensive data sanitization
- **Session management**: Automatic cleanup of expired sessions

### 🔹 Database Design
- **PostgreSQL** with Prisma ORM
- **Users table**: id, name, email, password_hash, role, provider, created_at, updated_at
- **Sessions table**: id, user_id, refresh_token, expiry
- **Scalable schema** with proper indexing and relationships

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database
- (Optional) Google OAuth credentials

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# Create and push database schema
npm run db:generate
npm run db:push

# Create first admin user
npm run setup:auth

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to project root
cd ..

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start frontend (if not already running)
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Login**: Use credentials created during setup
- **Database Studio**: `npm run db:studio` (in backend directory)

## 🔧 Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/pdf_converter_auth"

# JWT Configuration (Use strong, unique secrets!)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-minimum-32-characters"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
NODE_ENV="development"
PORT=5000
FRONTEND_URL="http://localhost:3000"

# Security
CSRF_SECRET="your-csrf-secret-key"
```

### Frontend Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📡 API Endpoints

### Authentication Routes
```
POST /api/auth/signup         # Register new user
POST /api/auth/login          # Email/password login  
POST /api/auth/google         # Google OAuth login
POST /api/auth/refresh-token  # Refresh access token
POST /api/auth/logout         # Logout user
GET  /api/auth/me            # Get current user profile
```

### Admin Routes (Requires ADMIN role)
```
GET   /api/admin/users           # List all users
PATCH /api/admin/users/:id/role  # Update user role
```

### Protected Routes (Requires authentication)
```
POST /convert                    # File conversion
POST /pdf-to-jpg                # PDF to image conversion
POST /pdf-to-word               # PDF to Word conversion
POST /pdf-to-excel              # PDF to Excel conversion
POST /pdf-to-powerpoint         # PDF to PowerPoint conversion
```

## 🎯 Usage Examples

### Frontend Authentication

```typescript
import { useAuth } from '@/contexts/AuthContext';

// Login
const { login } = useAuth();
const result = await login(email, password);
if (result.success) {
  router.push('/dashboard');
}

// Google Login
const { googleLogin } = useAuth();
const result = await googleLogin(credentialResponse.credential);

// Logout
const { logout } = useAuth();
await logout();
```

### Making Authenticated API Calls

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

### Admin Operations

```typescript
// Get all users (Admin only)
const response = await fetch('/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

// Update user role (Admin only)
await fetch(`/api/admin/users/${userId}/role`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ role: 'ADMIN' }),
});
```

## 🛡️ Security Implementation

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)  
- At least one number (0-9)
- At least one special character (@$!%*?&)

### JWT Token Security
- **Access tokens**: Short-lived (15 minutes)
- **Refresh tokens**: Long-lived (7 days) with rotation
- **Secure storage**: HttpOnly cookies recommended for production
- **Token validation**: Comprehensive verification on each request

### Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General endpoints**: 100 requests per 15 minutes per IP
- **Configurable limits** based on endpoint sensitivity

### Additional Security Measures
- **Helmet.js**: Security headers for XSS and clickjacking protection
- **CORS**: Configured for specific origins only
- **Input sanitization**: Prevents XSS and injection attacks
- **Session cleanup**: Automatic removal of expired sessions

## 🏗️ Architecture

### Database Schema
```sql
-- Users table
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

-- Sessions table  
CREATE TABLE sessions (
  id            VARCHAR PRIMARY KEY,
  user_id       VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR UNIQUE NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);
```

### Backend Structure
```
backend/
├── src/
│   ├── lib/
│   │   ├── auth.ts          # JWT utilities & password hashing
│   │   ├── database.ts      # Prisma client configuration
│   │   ├── googleAuth.ts    # Google OAuth integration
│   │   └── validation.ts    # Input validation schemas
│   ├── middleware/
│   │   ├── auth.ts          # Authentication & authorization
│   │   └── security.ts      # Security middleware & rate limiting
│   ├── routes/
│   │   └── auth.ts          # Authentication route handlers
│   └── server.ts            # Express server configuration
├── prisma/
│   └── schema.prisma        # Database schema definition
├── setup-auth.js            # Admin user creation script
└── AUTHENTICATION_SETUP.md  # Detailed setup guide
```

### Frontend Integration
- **React Context**: Centralized authentication state management
- **Route Protection**: HOC for protecting routes based on user roles
- **Automatic Token Refresh**: Transparent token renewal
- **Role-based UI**: Different interfaces for admin and regular users

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```
   Error: Connection refused
   ```
   - Check if PostgreSQL is running
   - Verify DATABASE_URL format in .env
   - Ensure database exists

2. **JWT Token Errors**
   ```
   Error: Invalid token
   ```
   - Check JWT_SECRET is set correctly
   - Verify token hasn't expired
   - Ensure proper Bearer token format

3. **Google OAuth Errors**
   ```
   Error: Invalid Google token
   ```
   - Verify GOOGLE_CLIENT_ID is correct
   - Check OAuth redirect URIs in Google Console
   - Ensure credentials.json is properly configured

4. **CORS Errors**
   ```
   Error: CORS policy blocked
   ```
   - Verify FRONTEND_URL in backend .env
   - Check allowed origins in CORS configuration

### Debug Commands

```bash
# Check database connection
npm run db:studio

# View server logs
npm run dev

# Test API endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check JWT token
node -e "console.log(require('jsonwebtoken').decode('YOUR_TOKEN_HERE'))"
```

## 🚀 Production Deployment

### Security Checklist
- [ ] Change all default secrets and passwords
- [ ] Use HTTPS in production
- [ ] Set secure database credentials
- [ ] Configure proper CORS origins
- [ ] Enable database SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Use environment-specific configurations
- [ ] Enable rate limiting in production
- [ ] Set up log aggregation

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:secure_password@prod_host:5432/prod_db?sslmode=require"
JWT_SECRET="production-super-secure-secret-minimum-64-characters"
FRONTEND_URL="https://yourdomain.com"
```

## 📈 Performance Considerations

- **Database Indexing**: Proper indexes on email, role, and foreign keys
- **Connection Pooling**: Prisma connection management
- **Caching**: Consider Redis for session storage in high-traffic scenarios
- **Rate Limiting**: Protects against abuse and DoS attacks
- **Token Optimization**: Short-lived access tokens reduce security risk

## 🤝 Contributing

1. Follow existing code patterns and conventions
2. Add tests for new features
3. Update documentation for API changes
4. Ensure security best practices are maintained
5. Test authentication flows thoroughly

## 📄 License

This authentication system is part of the PDF Converter project and follows the same licensing terms.

---

For detailed setup instructions, see [Backend Authentication Setup Guide](backend/AUTHENTICATION_SETUP.md).


