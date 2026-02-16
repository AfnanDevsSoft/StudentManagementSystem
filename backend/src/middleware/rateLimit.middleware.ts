/**
 * Rate Limiting Middleware
 * Prevents brute-force attacks and resource exhaustion
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiter for authentication endpoints (5 attempts per 15 minutes)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900 // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Create key based on IP + username for more targeted limiting
    const username = (req.body.username || 'unknown').toString().substring(0, 50);
    return `${req.ip}-${username}`;
  },
  skipSuccessfulRequests: false, // Count all attempts (including successful ones)
  handler: (req: Request, res: Response) => {
    console.warn(`[RATE LIMIT] Authentication rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 900
    });
  }
});

// Rate limiter for general API endpoints (100 requests per 15 minutes)
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    console.warn(`[RATE LIMIT] General API rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Stricter rate limiter for sensitive operations (10 requests per 15 minutes)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: {
    success: false,
    message: 'Too many requests to this sensitive endpoint. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RATE LIMIT] Sensitive endpoint rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests to this sensitive endpoint. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Rate limiter for upload endpoints (5 uploads per hour)
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 uploads per hour per IP
  message: {
    success: false,
    message: 'Too many upload attempts. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`[RATE LIMIT] Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many upload attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Apply rate limiter to all API routes
export const applyRateLimiting = {
  auth: authRateLimiter,
  general: generalRateLimiter,
  sensitive: sensitiveRateLimiter,
  upload: uploadRateLimiter
};
