"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCanDelete } from "@/lib/permissions";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function createLead(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) throw new Error("Name is required");

  const eventDateRaw = String(formData.get("eventDate") || "");
  const budgetRaw = String(formData.get("quoteAmount") || "");

  await prisma.lead.create({
    data: {
      fullName,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      eventType: String(formData.get("eventType") || "") || null,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
      budgetRange: String(formData.get("budgetRange") || "") || null,
      source: String(formData.get("source") || "landing_page"),
      notes: String(formData.get("notes") || "") || null,
      quoteAmount: budgetRaw ? Number(budgetRaw) : null,
      status: "new",
    },
  });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function updateLeadStatus(leadId: string, status: string) {
  await requireAdmin();
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as any },
  });
  revalidatePath("/admin/leads");
}

export async function updateLead(leadId: string, formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) throw new Error("Name is required");

  const eventDateRaw = String(formData.get("eventDate") || "");
  const budgetRaw = String(formData.get("quoteAmount") || "");

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      fullName,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      eventType: String(formData.get("eventType") || "") || null,
      eventDate: eventDateRaw ? new Date(eventDateRaw) : null,
      budgetRange: String(formData.get("budgetRange") || "") || null,
      source: String(formData.get("source") || "landing_page"),
      notes: String(formData.get("notes") || "") || null,
      quoteAmount: budgetRaw ? Number(budgetRaw) : null,
    },
  });

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}

export async function deleteLead(leadId: string) {
  await requireCanDelete();
  await prisma.lead.delete({ where: { id: leadId } });
  revalidatePath("/admin/leads");
}
