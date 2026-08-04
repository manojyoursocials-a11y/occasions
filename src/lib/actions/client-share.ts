"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

function randomPin() {
  return String(Math.floor(Math.random() * 900) + 100); // 3-digit, 100-999
}

export async function ensureShareLink(projectId: string) {
  await requireAdmin();

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");

  if (!project.shareToken) {
    await prisma.project.update({
      where: { id: projectId },
      data: { shareToken: randomUUID(), sharePin: project.sharePin || randomPin() },
    });
  }

  revalidatePath(`/admin/clients/${projectId}`);
}

export async function regenerateSharePin(projectId: string) {
  await requireAdmin();
  await prisma.project.update({
    where: { id: projectId },
    data: { sharePin: randomPin() },
  });
  revalidatePath(`/admin/clients/${projectId}`);
}

// Public — called from the unauthenticated /client/[token] page.
export async function verifyClientAccess(token: string, pin: string) {
  const project = await prisma.project.findUnique({
    where: { shareToken: token },
    include: {
      client: true,
      installments: { orderBy: { dueDate: "asc" } },
      schedule: { orderBy: { sortOrder: "asc" } },
      contract: true,
    },
  });

  if (!project || !project.sharePin || project.sharePin !== pin) {
    return { ok: false as const };
  }

  return {
    ok: true as const,
    project: {
      title: project.title,
      eventType: project.eventType,
      eventDateISO: project.eventDate.toISOString(),
      venue: project.venue,
      totalQuote: Number(project.totalQuote),
      amountPaid: Number(project.amountPaid),
      contractStatus: project.contractStatus,
      clientName: project.client?.fullName || null,
      installments: project.installments.map((i) => ({
        id: i.id,
        label: i.label,
        amount: Number(i.amount),
        dueDateISO: i.dueDate.toISOString(),
        status: i.status,
      })),
      schedule: project.schedule.map((s) => ({
        id: s.id,
        title: s.title,
        eventDateISO: s.eventDate.toISOString(),
        startTime: s.startTime,
        location: s.location,
      })),
    },
  };
}
