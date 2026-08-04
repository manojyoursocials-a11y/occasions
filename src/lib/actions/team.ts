"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Not authorized");
  }
  return session;
}

export async function createTeamMember(formData: FormData) {
  await requireAdmin();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) throw new Error("Name is required");

  await prisma.teamMember.create({
    data: {
      fullName,
      role: String(formData.get("role") || "other") as any,
      email: String(formData.get("email") || "") || null,
      phone: String(formData.get("phone") || "") || null,
    },
  });

  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function toggleTeamMemberActive(memberId: string, active: boolean) {
  await requireAdmin();
  await prisma.teamMember.update({
    where: { id: memberId },
    data: { active },
  });
  revalidatePath("/admin/team");
}

export async function assignTeamMember(formData: FormData) {
  await requireAdmin();

  const projectId = String(formData.get("projectId") || "");
  const teamMemberId = String(formData.get("teamMemberId") || "");
  const shootLabel = String(formData.get("shootLabel") || "") || null;
  if (!projectId || !teamMemberId) throw new Error("Project and team member are required");

  await prisma.projectAssignment.create({
    data: { projectId, teamMemberId, shootLabel },
  });

  revalidatePath(`/admin/clients/${projectId}`);
}
