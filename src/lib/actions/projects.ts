"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function createProject(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const eventDateRaw = String(formData.get("eventDate") || "");
  if (!title || !eventDateRaw) throw new Error("Title and event date are required");

  const clientMode = String(formData.get("clientMode") || "existing");
  let clientId: string | null = null;

  if (clientMode === "existing") {
    clientId = String(formData.get("existingClientId") || "") || null;
  } else {
    // Create a brand-new client account on the fly.
    const clientName = String(formData.get("newClientName") || "").trim();
    const clientEmail = String(formData.get("newClientEmail") || "").trim().toLowerCase();
    if (!clientName || !clientEmail) {
      throw new Error("New client name and email are required");
    }
    const existing = await prisma.user.findUnique({ where: { email: clientEmail } });
    if (existing) {
      clientId = existing.id;
    } else {
      const tempPassword = randomBytes(6).toString("base64url");
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const newClient = await prisma.user.create({
        data: {
          fullName: clientName,
          email: clientEmail,
          passwordHash,
          role: "client",
        },
      });
      clientId = newClient.id;
      // In production this temp password should be emailed to the client
      // instead of just logged — wiring that up is a natural next step.
      console.log(`New client "${clientName}" <${clientEmail}> temp password: ${tempPassword}`);
    }
  }

  const project = await prisma.project.create({
    data: {
      title,
      clientId,
      eventType: String(formData.get("eventType") || "Wedding"),
      eventDate: new Date(eventDateRaw),
      venue: String(formData.get("venue") || "") || null,
      totalQuote: Number(formData.get("totalQuote") || 0),
      amountPaid: Number(formData.get("amountPaid") || 0),
    },
  });

  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${project.id}`);
}

export async function updateProjectOverview(projectId: string, formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const eventDateRaw = String(formData.get("eventDate") || "");
  if (!title || !eventDateRaw) throw new Error("Title and event date are required");

  await prisma.project.update({
    where: { id: projectId },
    data: {
      title,
      eventType: String(formData.get("eventType") || "Wedding"),
      eventDate: new Date(eventDateRaw),
      venue: String(formData.get("venue") || "") || null,
      totalQuote: Number(formData.get("totalQuote") || 0),
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${projectId}`);
}

export async function markContractSigned(projectId: string) {
  await requireAdmin();
  await prisma.project.update({
    where: { id: projectId },
    data: { contractStatus: "signed" },
  });
  await prisma.contract.upsert({
    where: { projectId },
    update: { status: "signed", signedAt: new Date() },
    create: { projectId, status: "signed", signedAt: new Date() },
  });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${projectId}`);
}

export async function sendContract(projectId: string, formData: FormData) {
  await requireAdmin();
  const fileUrl = String(formData.get("fileUrl") || "");

  await prisma.project.update({
    where: { id: projectId },
    data: { contractStatus: "sent" },
  });
  await prisma.contract.upsert({
    where: { projectId },
    update: { status: "sent", sentAt: new Date(), fileUrl },
    create: { projectId, status: "sent", sentAt: new Date(), fileUrl },
  });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${projectId}`);
}
