
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLE_CODES: Record<string, string> = {
  'teacher': 'TCH',
  'student': 'STD',
  'admin': 'ADM',
  'superadmin': 'SUP',
  'staff': 'STF'
};

/**
 * Generate a system ID based on the format: [BranchCode][RoleCode][SequentialNumber]
 * Example: TCH-BR001-045
 */
export async function generateSystemId(branchId: string, roleName: string): Promise<string> {
  try {
    // 1. Get Branch Code
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { code: true }
    });

    if (!branch?.code) {
      throw new Error("Branch code not found");
    }

    // 2. Get Role Code
    const normalizedRole = roleName.toLowerCase();
    const roleCode = ROLE_CODES[normalizedRole] || 'USR';

    // 3. Find the next sequential number
    // We look for the last user with this prefix
    const prefix = `${roleCode}-${branch.code}-`;
    
    // Find the latest user with this prefix in their username
    // Note: This relies on the username following the convention. 
    // If users can change usernames, we might need a separate field for system_id.
    const lastUser = await prisma.user.findFirst({
      where: {
        username: {
          startsWith: prefix
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      select: {
        username: true
      }
    });

    let sequence = 1;
    if (lastUser && lastUser.username) {
        const parts = lastUser.username.split('-');
        if (parts.length === 3) {
            const lastSeq = parseInt(parts[2]);
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }
    }

    // 4. Format the ID
    const paddedSequence = sequence.toString().padStart(3, '0');
    return `${roleCode}-${branch.code}-${paddedSequence}`;

  } catch (error) {
    console.error("Error generating system ID:", error);
    throw error;
  }
}
