import express, { Router, Request, Response } from "express";
import UserService from "../services/user.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";

    const result = await UserService.getAllUsers(page, limit, search);
    sendResponse(
      res,
      200,
      result.success,
      result.message,
      result.data,
      result.pagination
    );
  }
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await UserService.getUserById(id);

    if (!result.success) {
      sendResponse(res, 404, false, result.message);
      return;
    }

    sendResponse(res, 200, result.success, result.message, result.data);
  }
);

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post(
  "/",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const result = await UserService.createUser(req.body);
    const statusCode = result.success ? 201 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await UserService.updateUser(id, req.body);
    const statusCode = result.success ? 200 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

/**
 * PATCH endpoint for user updates (same as PUT)
 */
router.patch(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await UserService.updateUser(id, req.body);
    const statusCode = result.success ? 200 : 400;
    sendResponse(res, statusCode, result.success, result.message, result.data);
  }
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete(
  "/:id",
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await UserService.deleteUser(id);
    sendResponse(
      res,
      result.success ? 200 : 400,
      result.success,
      result.message
    );
  }
);

export default router;
