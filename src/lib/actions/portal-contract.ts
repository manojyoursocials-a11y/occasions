"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { revalidatePath } from "next/cache";

export async function clientSignContract(projectId: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Not authorized");

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.clientId !== session.user.id) {
    throw new Error("Not authorized");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { contractStatus: "signed" },
  });
  await prisma.contract.upsert({
    where: { projectId },
    update: { status: "signed", signedAt: new Date() },
    create: { projectId, status: "signed", signedAt: new Date() },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/contract");
}
