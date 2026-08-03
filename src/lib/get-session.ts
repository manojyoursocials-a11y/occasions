import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Convenience wrapper for Server Components / route handlers.
export function getSession() {
  return getServerSession(authOptions);
}
