import Link from "next/link";
import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate, daysUntil } from "@/lib/utils";
import { ChevronRight, FileWarning, Clock } from "lucide-react";

export default async function PortalDashboard() {
  const session = await getSession();
  const userId = session!.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const project = await prisma.project.findFirst({
    where: { clientId: userId },
    orderBy: { eventDate: "asc" },
  });

  const nextInstallment = project
    ? await prisma.paymentInstallment.findFirst({
        where: { projectId: project.id, status: { not: "paid" } },
        orderBy: { dueDate: "asc" },
      })
    : null;

  const totalQuote = project ? Number(project.totalQuote) : 0;
  const amountPaid = project ? Number(project.amountPaid) : 0;
  const paidPct = totalQuote ? Math.round((amountPaid / totalQuote) * 100) : 0;
  const contractSigned = project?.contractStatus === "signed";

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">
        Welcome, {user?.fullName?.split(" ")[0] || "there"}
      </h1>
      <p className="mt-1 text-sm text-ink/50">
        {user?.companyName || "The Occasions Event Planners"}
        {project ? ` · ${project.title}` : ""}
      </p>

      {!project ? (
        <Card className="mt-6">
          <p className="text-sm text-ink/60">
            Your planner hasn&apos;t linked a project to your account yet. Check back soon.
          </p>
        </Card>
      ) : (
        <>
          {!contractSigned && (
            <Link
              href="/portal/contract"
              className="focus-ring mt-6 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-5 py-4 transition hover:bg-red-100/70"
            >
              <span className="flex items-center gap-3">
                <FileWarning className="h-5 w-5 text-red-600" />
                <span>
                  <span className="block text-sm font-semibold text-red-700">
                    Contract Pending Signature
                  </span>
                  <span className="block text-sm text-red-600/80">
                    Tap to review and sign your agreement
                  </span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-red-500" />
            </Link>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardLabel>Total Quote</CardLabel>
              <p className="text-2xl font-semibold text-ink">{formatINR(totalQuote)}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${Math.min(paidPct, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-sm font-medium text-green-600">
                {formatINR(amountPaid)} paid
              </p>
            </Card>

            <Card>
              <CardLabel>Event Countdown</CardLabel>
              <p className="text-2xl font-semibold text-ink">
                {Math.max(daysUntil(project.eventDate.toISOString()), 0)}
              </p>
              <p className="text-sm text-ink/50">days to go</p>
              <p className="mt-2 text-xs text-ink/40">
                {project.eventType} · {formatDate(project.eventDate.toISOString())}
              </p>
            </Card>
          </div>

          {nextInstallment && (
            <Card className="mt-4 flex items-center justify-between">
              <div>
                <CardLabel>Next Payment Due</CardLabel>
                <p className="text-sm text-ink/60">{nextInstallment.label}</p>
                <p className="text-2xl font-semibold text-ink">
                  {formatINR(Number(nextInstallment.amount))}
                </p>
              </div>
              <div className="text-right">
                <Badge tone="amber">
                  <Clock className="h-3 w-3" /> Due Soon
                </Badge>
                <p className="mt-2 text-sm text-ink/40">
                  {formatDate(nextInstallment.dueDate.toISOString())}
                </p>
              </div>
            </Card>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardLabel>Contract</CardLabel>
              <p
                className={`flex items-center gap-1.5 text-base font-semibold ${
                  contractSigned ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {contractSigned ? "Signed" : "Unsigned"}
              </p>
              <Link href="/portal/contract" className="text-sm text-ink/50 hover:text-ink/70">
                {contractSigned ? "View contract" : "Tap to sign"} →
              </Link>
            </Card>

            <Card>
              <CardLabel>Gallery</CardLabel>
              <p className="flex items-center gap-1.5 text-base font-semibold text-amber-600">
                <Clock className="h-4 w-4" /> In Progress
              </p>
              <p className="text-sm text-ink/50">
                {project.galleryItemsReady} of {project.galleryItemsTotal} items ready
              </p>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
