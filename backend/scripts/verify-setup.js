#!/usr/bin/env node

/**
 * Backend Setup Verification Script
 *
 * This script verifies that all prerequisites are installed and configured correctly
 * before running the backend server.
 *
 * Run: npm run verify-setup (or node scripts/verify-setup.js directly)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, packageName) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    log(`✓ ${packageName} is installed`, "green");
    return true;
  } catch (error) {
    log(`✗ ${packageName} is NOT installed`, "red");
    return false;
  }
}

function checkFile(filePath, fileName) {
  if (fs.existsSync(filePath)) {
    log(`✓ ${fileName} exists`, "green");
    return true;
  } else {
    log(`✗ ${fileName} NOT found at ${filePath}`, "red");
    return false;
  }
}

function checkEnvVariable(variable, envFile) {
  const content = fs.readFileSync(envFile, "utf-8");
  if (content.includes(`${variable}=`)) {
    log(`✓ ${variable} is configured`, "green");
    return true;
  } else {
    log(`✗ ${variable} is NOT configured`, "red");
    return false;
  }
}

async function testDatabaseConnection() {
  try {
    const dotenv = require("dotenv");
    const envPath = path.resolve(__dirname, "../.env");
    const envVars = dotenv.config({ path: envPath });

    const connectionString = envVars.parsed?.DATABASE_URL;
    if (!connectionString) {
      log("✗ DATABASE_URL not configured", "red");
      return false;
    }

    log("Testing database connection...", "cyan");
    // This would require pg package, for now just check if env var exists
    if (
      connectionString.includes("localhost") &&
      connectionString.includes("5432")
    ) {
      log("✓ Database URL configured for localhost:5432", "green");
      return true;
    } else {
      log("⚠ Database URL might not be correct: " + connectionString, "yellow");
      return false;
    }
  } catch (error) {
    log("⚠ Could not test database connection: " + error.message, "yellow");
    return false;
  }
}

async function runVerification() {
  log(
    "\n╔════════════════════════════════════════════════════════════╗",
    "blue"
  );
  log("║       KoolHub Backend - Setup Verification Script         ║", "blue");
  log(
    "╚════════════════════════════════════════════════════════════╝\n",
    "blue"
  );

  let allChecks = true;

  // Check system requirements
  log("📋 System Requirements:", "cyan");
  allChecks &= checkCommand("node", "Node.js");
  allChecks &= checkCommand("npm", "npm");

  log("\n📦 Project Files:", "cyan");
  const rootDir = path.resolve(__dirname, "..");
  allChecks &= checkFile(path.join(rootDir, "package.json"), "package.json");
  allChecks &= checkFile(path.join(rootDir, ".env"), ".env");
  allChecks &= checkFile(path.join(rootDir, "tsconfig.json"), "tsconfig.json");
  allChecks &= checkFile(
    path.join(rootDir, "prisma", "schema.prisma"),
    "prisma/schema.prisma"
  );

  log("\n📂 Directory Structure:", "cyan");
  const dirs = ["src", "src/routes", "src/middleware", "src/config", "prisma"];
  for (const dir of dirs) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      log(`✓ Directory ${dir}/ exists`, "green");
    } else {
      log(`✗ Directory ${dir}/ NOT found`, "red");
      allChecks = false;
    }
  }

  log("\n🔐 Environment Configuration:", "cyan");
  const envFile = path.join(rootDir, ".env");
  allChecks &= checkEnvVariable("DATABASE_URL", envFile);
  allChecks &= checkEnvVariable("NODE_ENV", envFile);
  allChecks &= checkEnvVariable("PORT", envFile);
  allChecks &= checkEnvVariable("JWT_SECRET", envFile);

  log("\n🗄️  Database Configuration:", "cyan");
  allChecks &= checkEnvVariable("POSTGRES_HOST", envFile);
  allChecks &= checkEnvVariable("POSTGRES_PORT", envFile);
  allChecks &= checkEnvVariable("POSTGRES_DB", envFile);
  allChecks &= checkEnvVariable("POSTGRES_USER", envFile);
  // allChecks &= await testDatabaseConnection(); // Requires pg package

  log("\n📝 Dependencies Status:", "cyan");
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (fs.existsSync(path.join(rootDir, "node_modules"))) {
    log("✓ Dependencies installed (node_modules exists)", "green");
    log(
      `  Total packages: ${Object.keys(packageJson.dependencies).length} dependencies`,
      "cyan"
    );
    log(
      `  Dev packages: ${Object.keys(packageJson.devDependencies).length} devDependencies`,
      "cyan"
    );
  } else {
    log("✗ Dependencies NOT installed (run: npm install)", "red");
    allChecks = false;
  }

  log("\n📚 API Routes:", "cyan");
  const routeFiles = [
    "src/routes/auth.routes.ts",
    "src/routes/branches.routes.ts",
    "src/routes/users.routes.ts",
    "src/routes/students.routes.ts",
    "src/routes/teachers.routes.ts",
    "src/routes/courses.routes.ts",
    "src/routes/health.routes.ts",
  ];

  for (const file of routeFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, "green");
    } else {
      log(`✗ ${file} NOT found`, "red");
      allChecks = false;
    }
  }

  // Summary
  log("\n" + "=".repeat(60), "blue");
  if (allChecks) {
    log("✅ ALL CHECKS PASSED!", "green");
    log("\nNext Steps:", "cyan");
    log("1. Ensure PostgreSQL is running on localhost:5432", "yellow");
    log("2. Create database: createdb -U postgres schoolManagement", "yellow");
    log("3. Run migrations: npm run db:migrate", "yellow");
    log("4. Start server: npm run dev", "yellow");
    log("5. Access Swagger docs: http://localhost:3000/api/docs", "yellow");
  } else {
    log("❌ SOME CHECKS FAILED", "red");
    log("\nPlease fix the issues above and try again.", "yellow");
    log("\nFor help, see README.md or BACKEND_SETUP.md", "cyan");
    process.exit(1);
  }

  log("=".repeat(60) + "\n", "blue");
}

// Run verification
runVerification().catch((error) => {
  log(`\nError during verification: ${error.message}`, "red");
  process.exit(1);
});
