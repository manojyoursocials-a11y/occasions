"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { requireOwner } from "@/lib/permissions";

export async function createAdminUser(formData: FormData) {
  await requireOwner();

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!fullName || !email || !password) {
    throw new Error("Name, email, and password are required");
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "admin",
      canDelete: formData.get("canDelete") === "on",
      isOwner: false, // owners can only be promoted explicitly, never on creation
    },
  });

  revalidatePath("/admin/team/logins");
  redirect("/admin/team/logins");
}

export async function updateAdminUser(userId: string, formData: FormData) {
  await requireOwner();

  const fullName = String(formData.get("fullName") || "").trim();
  if (!fullName) throw new Error("Name is required");

  const newPassword = String(formData.get("password") || "");
  const data: { fullName: string; canDelete: boolean; passwordHash?: string } = {
    fullName,
    canDelete: formData.get("canDelete") === "on",
  };

  if (newPassword) {
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({ where: { id: userId }, data });

  revalidatePath("/admin/team/logins");
}

export async function deleteAdminUser(userId: string) {
  const session = await requireOwner();

  if (userId === session.user.id) {
    throw new Error("You can't remove your own account.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Account not found");

  if (target.isOwner) {
    const ownerCount = await prisma.user.count({ where: { isOwner: true } });
    if (ownerCount <= 1) {
      throw new Error("Can't remove the last owner account.");
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/team/logins");
}
