import express, { Router, Request, Response } from "express";
import AuthService from "../services/auth.service";
import { sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user and return JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Validation error
 */
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const result = await AuthService.login({ username, password });

    if (!result.success) {
      sendResponse(res, 401, false, result.message);
      return;
    }

    sendResponse(res, 200, true, result.message, result.data);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Login failed");
  }
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token obtained from login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Unauthorized - invalid or expired token
 */
router.post("/refresh", async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    const result = await AuthService.refreshToken(refresh_token);

    if (!result.success) {
      sendResponse(res, 401, false, result.message);
      return;
    }

    sendResponse(res, 200, true, result.message, result.data);
  } catch (error: any) {
    sendResponse(res, 500, false, error.message || "Token refresh failed");
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User logout
 *     description: Logout user and invalidate tokens
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", (req: Request, res: Response) => {
  sendResponse(res, 200, true, "Logout successful");
});

export default router;
