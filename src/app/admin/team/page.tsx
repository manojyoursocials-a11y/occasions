import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ActiveToggle } from "@/components/admin/ActiveToggle";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTeamMember } from "@/lib/actions/team";
import { getSession } from "@/lib/get-session";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { fullName: "asc" } });

  const session = await getSession();
  const currentUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const canDelete = Boolean(currentUser?.canDelete || currentUser?.isOwner);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Team</h1>
          <p className="mt-1 text-sm text-ink/50">Your crew, and who can log into the studio</p>
        </div>
        <Link href="/admin/team/new">
          <Button>+ Add Crew Member</Button>
        </Link>
      </div>

      {/* Sub-tabs */}
      <div className="mt-4 flex gap-1 border-b border-black/5">
        <div className="border-b-2 border-brand-700 px-3 py-2 text-sm font-medium text-brand-800">
          Crew
        </div>
        <Link
          href="/admin/team/logins"
          className="px-3 py-2 text-sm text-ink/50 hover:text-ink/70"
        >
          Admin Logins
        </Link>
      </div>

      <p className="mt-4 text-xs text-ink/40">
        Crew are photographers/editors you assign to shoots — they don't log in.
        Studio staff who need to log into this dashboard are managed under
        &quot;Admin Logins&quot;.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 && (
          <Card><p className="text-sm text-ink/50">No crew added yet.</p></Card>
        )}
        {members.map((m) => (
          <Card key={m.id}>
            <p className="text-sm font-semibold text-ink">{m.fullName}</p>
            <p className="text-xs text-ink/40">{m.email}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="brand">{m.role}</Badge>
              <ActiveToggle memberId={m.id} active={m.active} />
            </div>
            {canDelete && (
              <div className="mt-2 border-t border-black/5 pt-2">
                <DeleteButton
                  action={deleteTeamMember.bind(null, m.id)}
                  confirmMessage={`Remove ${m.fullName} from your crew? Existing shoot assignments referencing them will also be removed.`}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
