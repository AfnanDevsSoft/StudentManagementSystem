/**
 * Metrics Routes
 * Exposes Prometheus metrics endpoint
 */

import express, { Router } from "express";
import { metricsEndpoint } from "../lib/metrics";

const router: Router = express.Router();

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Returns application metrics in Prometheus format
 *     tags:
 *       - Monitoring
 *     parameters:
 *       - in: header
 *         name: X-Metrics-Token
 *         required: false
 *         schema:
 *           type: string
 *         description: Authorization token (if METRICS_TOKEN is configured)
 *     responses:
 *       200:
 *         description: Metrics in Prometheus format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized - invalid or missing metrics token
 *       500:
 *         description: Failed to generate metrics
 */
router.get("/", async (req, res) => {
  await metricsEndpoint(req, res);
});

export default router;
