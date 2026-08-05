import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteAdminUser } from "@/lib/actions/admin-users";
import { formatDate } from "@/lib/utils";
import { Pencil, ShieldCheck, Lock } from "lucide-react";

export default async function AdminLoginsPage() {
  const session = await getSession();
  const currentUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;

  if (!currentUser?.isOwner) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex gap-1 border-b border-black/5">
          <Link href="/admin/team" className="px-3 py-2 text-sm text-ink/50 hover:text-ink/70">
            Crew
          </Link>
          <div className="border-b-2 border-brand-700 px-3 py-2 text-sm font-medium text-brand-800">
            Admin Logins
          </div>
        </div>
        <Card className="flex flex-col items-center py-10 text-center">
          <Lock className="h-8 w-8 text-ink/30" />
          <p className="mt-3 text-sm text-ink/60">
            Only the studio owner can view and manage admin login accounts.
          </p>
        </Card>
      </div>
    );
  }

  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Admin Logins</h1>
          <p className="mt-1 text-sm text-ink/50">Who can sign into this dashboard, and what they can do</p>
        </div>
        <Link href="/admin/team/logins/new">
          <Button>+ Add Login</Button>
        </Link>
      </div>

      <div className="mt-4 flex gap-1 border-b border-black/5">
        <Link href="/admin/team" className="px-3 py-2 text-sm text-ink/50 hover:text-ink/70">
          Crew
        </Link>
        <div className="border-b-2 border-brand-700 px-3 py-2 text-sm font-medium text-brand-800">
          Admin Logins
        </div>
      </div>

      <Card className="mt-4 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Access</th>
              <th className="px-5 py-3 font-medium">Added</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 font-medium text-ink">
                  {a.fullName}
                  {a.id === currentUser.id && <span className="ml-2 text-xs text-ink/35">(you)</span>}
                </td>
                <td className="px-5 py-3 text-ink/60">{a.email}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {a.isOwner && (
                      <Badge tone="brand">
                        <ShieldCheck className="h-3 w-3" /> Owner
                      </Badge>
                    )}
                    <Badge tone={a.canDelete ? "green" : "gray"}>
                      {a.canDelete ? "Can delete" : "Can't delete"}
                    </Badge>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink/40">{formatDate(a.createdAt.toISOString())}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/team/logins/${a.id}/edit`}
                      className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink/60 hover:bg-black/5"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                    {a.id !== currentUser.id && (
                      <DeleteButton
                        action={deleteAdminUser.bind(null, a.id)}
                        confirmMessage={`Remove ${a.fullName}'s login access? They won't be able to sign in anymore.`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <p className="mt-4 text-xs text-ink/40">
        Everyone here gets admin access to the full dashboard. &quot;Can delete&quot;
        controls whether they can permanently remove enquiries, projects, and
        crew — turn it off for anyone who should only create and edit.
      </p>
    </div>
  );
}
