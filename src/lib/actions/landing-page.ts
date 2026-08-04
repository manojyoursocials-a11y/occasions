"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function getLandingPageSettings() {
  const settings = await prisma.landingPageSettings.findUnique({ where: { id: 1 } });
  if (settings) return settings;
  // Create the singleton row with defaults on first visit.
  return prisma.landingPageSettings.create({ data: { id: 1 } });
}

export async function updateLandingPageSettings(formData: FormData) {
  await requireAdmin();

  await prisma.landingPageSettings.upsert({
    where: { id: 1 },
    update: {
      heading: String(formData.get("heading") || "Let's capture your story"),
      subheading: String(formData.get("subheading") || ""),
      coverImageUrl: String(formData.get("coverImageUrl") || "") || null,
    },
    create: {
      id: 1,
      heading: String(formData.get("heading") || "Let's capture your story"),
      subheading: String(formData.get("subheading") || ""),
      coverImageUrl: String(formData.get("coverImageUrl") || "") || null,
    },
  });

  revalidatePath("/admin/leads/landing-page");
  revalidatePath("/enquire");
}

// No auth required — this is the public enquiry form's submit handler.
export async function submitPublicEnquiry(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) throw new Error("Name is required");

  await prisma.lead.create({
    data: {
      fullName,
      phone: String(formData.get("phone") || "") || null,
      eventType: String(formData.get("eventDetails") || "") || null,
      budgetRange: String(formData.get("budget") || "") || null,
      source: "landing_page",
      notes: String(formData.get("venue") || "")
        ? `Venue/Location: ${formData.get("venue")}${formData.get("guests") ? ` · Guests: ${formData.get("guests")}` : ""}`
        : null,
      status: "new",
    },
  });

  redirect("/enquire?submitted=1");
}
