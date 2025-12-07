import { PrismaClient } from '@prisma/client';

// Shared Prisma client instance
// In test environment, this will be set by testDb.ts
// In production, it creates a new client on first use
let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
}

// Allow tests to override the prisma instance BEFORE first use
export function setPrismaClient(client: PrismaClient) {
    prismaInstance = client;
}

// Export lazy-loaded prisma instance
// THIS MUST BE ACCESSED AS A GETTER, NOT CACHED
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient();
        return (client as any)[prop];
    }
});
