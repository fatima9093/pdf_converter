# Secure HTTP-Only Cookie Authentication Implementation

This document provides a complete implementation of secure token-based authentication using HTTP-only cookies for a Next.js/Express.js application.

## 🔐 Security Features Implemented

- ✅ HTTP-only cookies (cannot be accessed via JavaScript)
- ✅ Secure flag for HTTPS in production
- ✅ SameSite protection against CSRF attacks
- ✅ Automatic cookie expiration
- ✅ No localStorage usage (prevents XSS token theft)
- ✅ CORS configuration with credentials
- ✅ Token refresh mechanism
- ✅ Secure logout with cookie clearing

## 📁 File Structure

```
backend/src/
├── middleware/auth.ts          # Express middleware for cookie-based auth
├── routes/auth.ts              # Login/logout routes with cookie setting
├── server.ts                   # Express server with cookie-parser
└── lib/auth.ts                 # JWT utilities

src/
├── app/api/auth/
│   ├── login/route.ts          # Next.js login API with cookies
│   ├── logout/route.ts         # Next.js logout API
│   ├── refresh/route.ts        # Token refresh API
│   └── me/route.ts             # Protected user profile API
├── middleware/auth.ts          # Next.js middleware utilities
├── contexts/AuthContext.tsx    # React context without localStorage
└── lib/api.ts                  # API utilities with credentials
```

## 🚀 Implementation Examples

### 1. Backend Login Route (Express.js)

```typescript
// backend/src/routes/auth.ts
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    // ... authentication logic ...
    
    const accessToken = AuthService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookies for secure token storage
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,                    // Cannot be accessed via JavaScript
      secure: isProduction,              // HTTPS only in production
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
      maxAge: 15 * 60 * 1000,           // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    // ... error handling ...
  }
});
```

### 2. Backend Authentication Middleware

```typescript
// backend/src/middleware/auth.ts
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from HTTP-only cookie first, then fall back to Authorization header
    let token = req.cookies?.accessToken;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }
    
    try {
      const payload = AuthService.verifyAccessToken(token);
      
      // Verify user still exists and is not blocked
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, isBlocked: true },
      });

      if (!user || user.isBlocked) {
        res.status(401).json({ 
          success: false, 
          message: 'User not found or blocked' 
        });
        return;
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (jwtError) {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};
```

### 3. Next.js API Route with HTTP-only Cookies

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // ... authentication logic ...

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Set HTTP-only cookies with secure configuration
    const isProduction = process.env.NODE_ENV === 'production';
    
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60, // 15 minutes in seconds
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Protected API Route Example

```typescript
// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user;

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          role: user.role,
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
```

### 5. Next.js Middleware for Route Protection

```typescript
// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function validateToken(request: NextRequest): { isValid: boolean; user?: JWTPayload; error?: string } {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    
    if (!accessToken) {
      return { isValid: false, error: 'Access token not found' };
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret';
    
    try {
      const decoded = jwt.verify(accessToken, JWT_SECRET) as JWTPayload;
      return { isValid: true, user: decoded };
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        return { isValid: false, error: 'Access token has expired' };
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        return { isValid: false, error: 'Invalid access token' };
      } else {
        return { isValid: false, error: 'Token verification failed' };
      }
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false, error: 'Internal server error' };
  }
}

export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validation = validateToken(request);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Authentication required' },
        { status: 401 }
      );
    }

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = validation.user;
    
    return handler(authenticatedRequest);
  };
}
```

### 6. Frontend AuthContext (No localStorage)

```typescript
// src/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // With HTTP-only cookies, verify authentication by calling the /me endpoint
    verifyTokenAndSetUser();
  }, []);

  const verifyTokenAndSetUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Important: include cookies
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAuthState({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      } else if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          await verifyTokenAndSetUser();
          return;
        }
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Token verification error:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return { success: true, user: data.user };
      }
      
      return { success: false, message: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  // ... other methods
}
```

### 7. Client-Side API Calls

```typescript
// src/lib/api.ts
export async function apiFetch(url: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${url}`, {
    ...options,
    credentials: "include", // 🔑 Always send HTTP-only cookies
    headers: {
      ...options.headers,
    },
  });
}

// Example protected API call
export async function getProtectedData(): Promise<ApiResponse> {
  return apiFetch('/api/protected-endpoint', {
    method: 'GET',
    // No need to manually add Authorization header
    // Cookies are automatically included with credentials: 'include'
  });
}
```

## 🔒 Security Benefits

1. **XSS Protection**: Tokens stored in HTTP-only cookies cannot be accessed by malicious JavaScript
2. **CSRF Protection**: SameSite cookie attribute prevents cross-site request forgery
3. **Secure Transport**: Secure flag ensures cookies are only sent over HTTPS in production
4. **Automatic Expiration**: Cookies expire automatically, reducing the window for token theft
5. **No Client-Side Storage**: No sensitive data stored in localStorage or sessionStorage

## ⚙️ Configuration Requirements

### Environment Variables

```bash
# .env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
NODE_ENV=production
```

### Express Server Setup

```typescript
// backend/src/server.ts
import cookieParser from 'cookie-parser';

app.use(cookieParser()); // Parse HTTP-only cookies

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
```

## 🚨 Important Security Notes

1. **HTTPS Required**: Always use HTTPS in production for secure cookie transmission
2. **Secret Management**: Use strong, unique secrets and store them securely
3. **Token Expiration**: Keep access token expiration short (15 minutes recommended)
4. **Refresh Token Rotation**: Consider implementing refresh token rotation for enhanced security
5. **CORS Configuration**: Properly configure CORS with specific origins and credentials: true
6. **Cookie Security**: Always set httpOnly, secure, and sameSite flags appropriately

## 🧪 Testing the Implementation

```javascript
// Test login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});

// Test protected route
const protectedResponse = await fetch('/api/auth/me', {
  credentials: 'include' // Cookies sent automatically
});

// Test logout
await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});
```

This implementation provides a production-ready, secure authentication system using HTTP-only cookies that protects against common web vulnerabilities while maintaining a smooth user experience.
