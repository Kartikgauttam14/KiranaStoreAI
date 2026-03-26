/**
 * Auth Controller
 * Handles OTP generation, verification, and JWT token management
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate JWT tokens
function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

/**
 * Send OTP to user's phone number
 * POST /api/auth/send-otp
 */
export async function sendOtp(req: Request, res: Response) {
  try {
    const { phone, role } = req.body;

    // Validate input
    if (!phone || !role) {
      return res.status(400).json({
        success: false,
        error: 'Phone and role are required',
      });
    }

    // Validate phone format (10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
    }

    // Validate role
    if (!['STORE_OWNER', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP temporarily (in real app, use Redis or database)
    // For development, we'll just log it
    console.log(`🔐 OTP for ${phone}: ${otp} (expires at ${otpExpiry.toISOString()})`);

    // TODO: Send OTP via MSG91 SMS API
    // const smsService = require('./services/smsService');
    // await smsService.sendOTP(phone, otp);

    // Respond with success
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { otp, otpExpiry }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
}

/**
 * Verify OTP and create user if needed, return JWT tokens
 * POST /api/auth/verify-otp
 */
export async function verifyOtp(req: Request, res: Response) {
  try {
    const { phone, otp, role, name } = req.body;

    // Validate input
    if (!phone || !otp || !role) {
      return res.status(400).json({
        success: false,
        error: 'Phone, OTP, and role are required',
      });
    }

    // In development, accept any 6-digit OTP
    // In production, verify against stored OTP
    if (process.env.NODE_ENV === 'production' && otp.length !== 6) {
      return res.status(401).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    // For development testing, accept 123456 as universal OTP
    if (process.env.NODE_ENV === 'development' && otp !== '123456' && otp.length !== 6) {
      return res.status(401).json({
        success: false,
        error: 'Invalid OTP',
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          name: name || `User-${phone.slice(-4)}`,
          role: role as 'STORE_OWNER' | 'CUSTOMER',
          language: 'hi',
        },
      });
    } else {
      // Verify role matches
      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          error: `User registered as ${user.role}, not ${role}`,
        });
      }
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Respond with user data and tokens
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          language: user.language,
          profileImage: user.profileImage,
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour in seconds
        },
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to verify OTP',
    });
  }
}

/**
 * Refresh access token using refresh token
 * POST /api/auth/refresh
 */
export async function refreshToken(req: Request, res: Response) {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      role: string;
    };

    // Get user to verify they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.role
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token expired',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
}

/**
 * Get current user profile (requires authentication)
 * GET /api/auth/me
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stores: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            rating: true,
          },
        },
        addresses: {
          select: {
            id: true,
            label: true,
            line1: true,
            city: true,
            isDefault: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        language: user.language,
        profileImage: user.profileImage,
        isActive: user.isActive,
        createdAt: user.createdAt,
        stores: user.stores,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
}

/**
 * Update user profile (requires authentication)
 * PUT /api/auth/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { name, language, profileImage } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(language && { language }),
        ...(profileImage && { profileImage }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        language: user.language,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
}

/**
 * Logout (client-side, but provides endpoint for future server-side sessions)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response) {
  try {
    // In JWT-based auth, logout is primarily client-side (remove token)
    // This endpoint can be used for logging, blacklisting, etc. in future

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
}
