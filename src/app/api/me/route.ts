import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";

// Small helper the login page calls right after signing in, so it
// knows whether to send the user to /admin or /portal.
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ role: null }, { status: 401 });
  }
  return NextResponse.json({ role: session.user.role });
}
