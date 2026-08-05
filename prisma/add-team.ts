import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Real studio team accounts — each gets admin access to the CRM.
// This is a bulk/CLI way to onboard people; day-to-day, use the
// Admin Logins page in the app instead (Team → Admin Logins), which also
// lets the owner grant/revoke delete permission per person.
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
      // Re-running this always resets the password to the one listed above
      // (useful if someone's locked out) but deliberately leaves
      // canDelete/isOwner untouched if the account already exists, so it
      // won't silently undo a permission change made via the app.
      update: { passwordHash, fullName: member.fullName, role: "admin" },
      create: {
        email: member.email,
        passwordHash,
        fullName: member.fullName,
        role: "admin",
        companyName: "The Occasions Event Planners",
        isOwner: false,
        canDelete: false,
      },
    });
    console.log(`✓ ${member.fullName} — ${member.email}`);
  }
  console.log("\nAll team accounts created/updated with admin access.");
  console.log("By default they can't delete anything — grant that from");
  console.log("Team → Admin Logins in the app if needed.");
  console.log("Passwords were (re)set to the values in this file — each");
  console.log("person can also get a new password anytime via Team → Admin");
  console.log("Logins → Edit, without needing to re-run this script.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
