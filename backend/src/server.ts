import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import http from "http";
import app from "./app";
import { PrismaClient } from "@prisma/client";
import { initializePermissions } from "./lib/init-permissions";
import { initializeSocketIO } from "./socket";
import { setupGracefulShutdown, trackConnection } from "./utils/graceful-shutdown";
import { logger } from "./lib/logger";
import { initTracing, shutdownTracing } from "./lib/tracing";

console.log('--- SERVER RESTARTED WITH AUTO PERMISSION INITIALIZATION ---');

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

async function startServer() {
  try {
    // Initialize distributed tracing (must be early)
    initTracing();
    logger.info('Distributed tracing initialized', {
      component: 'server',
      event: 'tracing_initialized'
    });

    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully', {
      component: 'server',
      event: 'db_connected',
      database: `${process.env.POSTGRES_DB}@${process.env.POSTGRES_HOST}`
    });
    console.log("✓ Database connected successfully");

    // Initialize permissions system (auto-creates if empty)
    await initializePermissions();
    logger.info('Permissions initialized', {
      component: 'server',
      event: 'permissions_initialized'
    });

    // Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // Set up graceful shutdown handlers
    setupGracefulShutdown(httpServer, {
      timeout: 30000, // 30 second shutdown timeout
      cleanupHandlers: [
        // Socket.io cleanup
        async () => {
          logger.info('Cleaning up Socket.io connections', {
            component: 'shutdown',
            event: 'socket_io_cleanup'
          });
        },
        // Custom cleanup tasks can be added here
        async () => {
          logger.info('Custom cleanup: Clearing caches', {
            component: 'shutdown',
            event: 'cache_cleanup'
          });
        }
      ]
    });

    // Track connections for graceful shutdown
    httpServer.on('connection', (conn) => {
      trackConnection(conn);
    });

    // Initialize Socket.io with HTTP server
    initializeSocketIO(httpServer);
    logger.info('Socket.io initialized', {
      component: 'server',
      event: 'socket_initialized'
    });
    console.log("✓ Socket.io initialized");

    // Start server
    httpServer.listen(PORT, () => {
      logger.info('Server started successfully', {
        component: 'server',
        event: 'server_start',
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
      });
      
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         Afnan Devs SMS - API Server                   ║
║                                                                ║
║  🚀 Server running on http://localhost:${PORT}                   ║
║  🔌 Socket.io on ws://localhost:${PORT}                          ║
║  📚 API Documentation: http://localhost:${PORT}/api/docs       ║
║  🔗 API Base URL: http://localhost:${PORT}/api/v1              ║
║  🏥 Health Check: http://localhost:${PORT}/health               ║
║                                                                ║
║  ⚡ Graceful shutdown: ENABLED                                  ║
║  🔍 Monitoring: /health/ready, /health/live                     ║
║                                                                ║
║  Environment: ${process.env.NODE_ENV || "development"}                                 ║
║  Database: ${process.env.POSTGRES_DB}@${process.env.POSTGRES_HOST}                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      component: 'server',
      event: 'server_start_error',
      error
    });
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle shutdown signals (delegated to graceful shutdown handler)
process.on("SIGINT", () => {
  logger.warn('SIGINT received - graceful shutdown will handle', {
    component: 'signal',
    event: 'SIGINT_received'
  });
});

process.on("SIGTERM", () => {
  logger.warn('SIGTERM received - graceful shutdown will handle', {
    component: 'signal',
    event: 'SIGTERM_received'
  });
});

startServer();
