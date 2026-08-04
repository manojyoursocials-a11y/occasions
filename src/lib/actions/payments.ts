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

export async function createInstallment(formData: FormData) {
  await requireAdmin();

  const projectId = String(formData.get("projectId") || "");
  const label = String(formData.get("label") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const dueDateRaw = String(formData.get("dueDate") || "");
  if (!projectId || !label || !dueDateRaw) {
    throw new Error("Project, label, and due date are required");
  }

  await prisma.paymentInstallment.create({
    data: {
      projectId,
      label,
      amount,
      dueDate: new Date(dueDateRaw),
      status: "pending",
    },
  });

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/clients/${projectId}`);
}

export async function markInstallmentPaid(installmentId: string) {
  await requireAdmin();

  const installment = await prisma.paymentInstallment.update({
    where: { id: installmentId },
    data: { status: "paid", paidAt: new Date() },
  });

  await prisma.project.update({
    where: { id: installment.projectId },
    data: { amountPaid: { increment: installment.amount } },
  });

  revalidatePath("/admin/payments");
  revalidatePath(`/admin/clients/${installment.projectId}`);
  revalidatePath("/portal");
  revalidatePath("/portal/quote-payments");
}
