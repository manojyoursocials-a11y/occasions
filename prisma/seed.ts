import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  const clientPasswordHash = await bcrypt.hash("client1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@theoccasions.studio" },
    update: {},
    create: {
      email: "admin@theoccasions.studio",
      passwordHash: adminPasswordHash,
      fullName: "Studio Admin",
      role: "admin",
      companyName: "The Occasions Event Planners",
    },
  });

  const client = await prisma.user.upsert({
    where: { email: "ananya@example.com" },
    update: {},
    create: {
      email: "ananya@example.com",
      passwordHash: clientPasswordHash,
      fullName: "Ananya Sharma",
      role: "client",
      companyName: "The Occasions Event Planners",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project-ananya-karan" },
    update: {},
    create: {
      id: "seed-project-ananya-karan",
      clientId: client.id,
      title: "Ananya & Karan",
      eventType: "Wedding",
      eventDate: new Date("2026-09-14"),
      venue: "The Leela Palace, Chennai",
      totalQuote: 150000,
      amountPaid: 30000,
      contractStatus: "unsigned",
      galleryItemsTotal: 4,
      galleryItemsReady: 0,
    },
  });

  await prisma.paymentInstallment.createMany({
    data: [
      { projectId: project.id, label: "Advance", amount: 30000, dueDate: new Date("2026-07-01"), status: "paid" },
      { projectId: project.id, label: "Balance to 50%", amount: 45000, dueDate: new Date("2026-08-13"), status: "due_soon" },
      { projectId: project.id, label: "Final Payment", amount: 75000, dueDate: new Date("2026-09-10"), status: "pending" },
    ],
    skipDuplicates: true,
  });

  await prisma.lead.upsert({
    where: { id: "seed-lead-1" },
    update: {},
    create: {
      id: "seed-lead-1",
      fullName: "Priya & Arjun",
      email: "priya.arjun@example.com",
      eventType: "Wedding",
      eventDate: new Date("2026-11-20"),
      status: "new",
      source: "landing_page",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login: admin@theoccasions.studio / admin1234");
  console.log("Client login: ananya@example.com / client1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
