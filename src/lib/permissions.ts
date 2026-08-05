import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";

/** Any signed-in admin. Throws if not. Returns the session. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

/**
 * An admin with delete rights. Re-checks against the database rather than
 * trusting the session alone, so a permission revoked mid-session can't
 * still be used to delete something.
 */
export async function requireCanDelete() {
  const session = await requireAdmin();
  const fresh = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!fresh || (!fresh.canDelete && !fresh.isOwner)) {
    throw new Error("You don't have permission to delete this.");
  }
  return session;
}

/** The studio owner only — for managing other admin login accounts. */
export async function requireOwner() {
  const session = await requireAdmin();
  const fresh = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!fresh || !fresh.isOwner) {
    throw new Error("Only the studio owner can manage team login accounts.");
  }
  return session;
}
