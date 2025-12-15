import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import app from "./app";
import { PrismaClient } from "@prisma/client";
console.log('--- SERVER RESTARTED WITH RBAC FIXES V2 ---');

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected successfully");

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         KoolHub Student Management System - API Server        ║
║                                                                ║
║  🚀 Server running on http://localhost:${PORT}                   ║
║  📚 API Documentation: http://localhost:${PORT}/api/docs       ║
║  🔗 API Base URL: http://localhost:${PORT}/api/v1              ║
║                                                                ║
║  Environment: ${process.env.NODE_ENV || "development"}                                 ║
║  Database: ${process.env.POSTGRES_DB}@${process.env.POSTGRES_HOST}                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\nShutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
