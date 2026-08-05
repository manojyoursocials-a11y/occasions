import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { createAdminUser } from "@/lib/actions/admin-users";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Lock } from "lucide-react";

export default async function NewAdminLoginPage() {
  const session = await getSession();
  const currentUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  if (!currentUser?.isOwner) {
    return (
      <div className="mx-auto max-w-md">
        <Card className="flex flex-col items-center py-10 text-center">
          <Lock className="h-8 w-8 text-ink/30" />
          <p className="mt-3 text-sm text-ink/60">
            Only the studio owner can add admin login accounts.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Link href="/admin/team/logins" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Admin Logins
      </Link>
      <h1 className="text-2xl font-semibold text-ink">Add Login</h1>
      <p className="mt-1 text-sm text-ink/50">Give someone on your team dashboard access</p>

      <Card className="mt-6">
        <form action={createAdminUser}>
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required placeholder="e.g. Koushic" />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required placeholder="koushic@occasions.in" />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          </Field>

          <label className="mb-4 flex items-start gap-2 text-sm text-ink/70">
            <input type="checkbox" name="canDelete" className="mt-0.5" />
            <span>
              Allow this account to permanently delete enquiries, projects, and crew.
              Leave unchecked for accounts that should only create and edit.
            </span>
          </label>

          <Button type="submit" className="w-full">Create Login</Button>
        </form>
      </Card>
    </div>
  );
}
