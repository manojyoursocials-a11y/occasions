"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function triggerAutomation(template: string, channel: string, projectId?: string) {
  await requireAdmin();

  await prisma.automationEvent.create({
    data: {
      template,
      channel,
      projectId: projectId || null,
      status: "sent",
    },
  });

  revalidatePath("/admin/automation");
}
