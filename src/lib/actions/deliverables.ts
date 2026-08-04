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

export async function createDeliverable(formData: FormData) {
  await requireAdmin();

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  if (!projectId || !title) throw new Error("Project and title are required");

  const dueDateRaw = String(formData.get("dueDate") || "");
  const editorId = String(formData.get("editorId") || "") || null;

  await prisma.deliverable.create({
    data: {
      projectId,
      title,
      editorId,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      status: "not_started",
    },
  });

  revalidatePath("/admin/post-production");
  revalidatePath("/portal/deliverables");
}

export async function updateDeliverableStatus(deliverableId: string, status: string) {
  await requireAdmin();
  await prisma.deliverable.update({
    where: { id: deliverableId },
    data: { status: status as any },
  });
  revalidatePath("/admin/post-production");
  revalidatePath("/portal/deliverables");
}
