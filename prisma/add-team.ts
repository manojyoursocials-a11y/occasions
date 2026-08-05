import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Real studio team accounts — each gets full admin access to the CRM
// (there's currently only two access levels: admin and client; if you
// want restricted permissions per person later, that's a separate
// role/permissions system to build on top of this).
const TEAM = [
  { email: "koushic@occasions.in", password: "Koushic@123", fullName: "Koushic" },
  { email: "lingesh@occasions.in", password: "Lingesh@123", fullName: "Lingesh" },
  { email: "sathya@occasions.in", password: "Sathya@123", fullName: "Sathya" },
  { email: "saran@occasions.in", password: "Saran@123", fullName: "Saran" },
];

async function main() {
  for (const member of TEAM) {
    const passwordHash = await bcrypt.hash(member.password, 10);
    await prisma.user.upsert({
      where: { email: member.email },
      update: { passwordHash, fullName: member.fullName, role: "admin" },
      create: {
        email: member.email,
        passwordHash,
        fullName: member.fullName,
        role: "admin",
        companyName: "The Occasions Event Planners",
      },
    });
    console.log(`✓ ${member.fullName} — ${member.email}`);
  }
  console.log("\nAll team accounts created/updated with admin access.");
  console.log("Recommend each person changes their password after first login —");
  console.log("there's no in-app 'change password' screen yet, so for now that");
  console.log("means re-running this script with a new password, or updating");
  console.log("passwordHash directly via Prisma Studio.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
