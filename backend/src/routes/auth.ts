import express, { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../lib/auth';
import { GoogleAuthService } from '../lib/googleAuth';
import prisma from '../lib/database';
import { 
  signupValidation, 
  loginValidation, 
  googleAuthValidation
} from '../lib/validation';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { Role, Provider } from '@prisma/client';

const router = express.Router();

// Signup with email and password
router.post('/signup', signupValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Check if user should be admin (predefined admin emails)
    const adminEmails = ['fatimaahmad9093@gmail.com', 'admin@example.com'];
    const userRole = adminEmails.includes(email.toLowerCase()) ? Role.ADMIN : Role.USER;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        provider: Provider.EMAIL,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Login with email and password
router.post('/login', loginValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
      return;
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
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

    // Create session
    await AuthService.createSession(user.id);

    // Set HTTP-only cookies for secure token storage
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction, // Only use HTTPS in production
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Google OAuth login
router.post('/google', googleAuthValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
      return;
    }

    const { idToken } = req.body;

    // Verify Google token
    const googleUser = await GoogleAuthService.verifyIdToken(idToken);
    if (!googleUser) {
      res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
      return;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      // Check if user should be admin (predefined admin emails)
      const adminEmails = ['fatimaahmad9093@gmail.com', 'admin@example.com'];
      const userRole = adminEmails.includes(googleUser.email.toLowerCase()) ? Role.ADMIN : Role.USER;

      // Create new user
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.googleId,
          role: userRole,
          provider: Provider.GOOGLE,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId },
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact support.',
      });
      return;
    }

    // Generate tokens
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

    // Create session
    await AuthService.createSession(user.id);

    // Set HTTP-only cookies for secure token storage
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Refresh token
router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get refresh token from HTTP-only cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      });
      return;
    }

    // Validate session
    const session = await AuthService.validateSession(refreshToken);
    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = AuthService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = AuthService.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Revoke old session and create new one
    await AuthService.revokeSession(refreshToken);
    await AuthService.createSession(user.id);

    // Set new HTTP-only cookies
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await AuthService.revokeSession(refreshToken);
    } else {
      // Revoke all sessions for the user
      await AuthService.revokeAllUserSessions(req.user!.userId);
    }

    // Clear HTTP-only cookies
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;


