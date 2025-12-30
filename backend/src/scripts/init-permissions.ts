import { initializePermissions } from "../lib/init-permissions";

console.log("🔐 Running Permission Initialization Script...\n");

initializePermissions()
    .then(() => {
        console.log("\n✨ Permission initialization completed successfully!");
        process.exit(0);
    })
    .catch((error: any) => {
        console.error("\n❌ Permission initialization failed:", error);
        process.exit(1);
    });
