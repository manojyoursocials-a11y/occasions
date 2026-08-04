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

export async function createScheduleItem(formData: FormData) {
  await requireAdmin();

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  const eventDateRaw = String(formData.get("eventDate") || "");
  if (!projectId || !title || !eventDateRaw) {
    throw new Error("Project, title, and date are required");
  }

  const count = await prisma.eventScheduleItem.count({ where: { projectId } });

  await prisma.eventScheduleItem.create({
    data: {
      projectId,
      title,
      eventDate: new Date(eventDateRaw),
      startTime: String(formData.get("startTime") || "") || null,
      location: String(formData.get("location") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      sortOrder: count,
    },
  });

  revalidatePath(`/admin/clients/${projectId}`);
  revalidatePath("/portal/event-schedule");
}

export async function deleteScheduleItem(itemId: string, projectId: string) {
  await requireAdmin();
  await prisma.eventScheduleItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/clients/${projectId}`);
  revalidatePath("/portal/event-schedule");
}
