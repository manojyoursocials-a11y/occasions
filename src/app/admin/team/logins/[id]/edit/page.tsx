import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { updateAdminUser } from "@/lib/actions/admin-users";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Lock } from "lucide-react";

export default async function EditAdminLoginPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
            Only the studio owner can edit admin login accounts.
          </p>
        </Card>
      </div>
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "admin") notFound();

  const updateWithId = updateAdminUser.bind(null, target.id);

  return (
    <div className="mx-auto max-w-md">
      <Link href="/admin/team/logins" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Admin Logins
      </Link>
      <h1 className="text-2xl font-semibold text-ink">Edit Login</h1>
      <p className="mt-1 text-sm text-ink/50">{target.email}</p>

      <Card className="mt-6">
        <form action={updateWithId}>
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required defaultValue={target.fullName} />
          </Field>

          <Field label="New password (optional)" htmlFor="password">
            <Input id="password" name="password" type="password" minLength={8} placeholder="Leave blank to keep current password" />
          </Field>

          <label className="mb-4 flex items-start gap-2 text-sm text-ink/70">
            <input type="checkbox" name="canDelete" defaultChecked={target.canDelete} className="mt-0.5" />
            <span>
              Allow this account to permanently delete enquiries, projects, and crew.
            </span>
          </label>

          {target.isOwner && (
            <p className="mb-4 text-xs text-ink/40">
              This account is a studio owner. Ownership can&apos;t be changed from
              this form — it&apos;s intentionally left out to avoid accidentally
              locking yourself out.
            </p>
          )}

          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
