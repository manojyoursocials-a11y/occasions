import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

const STATUS_TONE = { paid: "green", due_soon: "amber", pending: "gray", overdue: "red" } as const;
const STATUS_LABEL = { paid: "Paid", due_soon: "Due Soon", pending: "Pending", overdue: "Overdue" } as const;

export default async function QuotePaymentsPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const installments = project
    ? await prisma.paymentInstallment.findMany({
        where: { projectId: project.id },
        orderBy: { dueDate: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink">Quote & Payments</h1>
      <p className="mt-1 text-sm text-ink/50">Your payment schedule for {project?.title || "your event"}</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card><CardLabel>Total Quote</CardLabel><p className="text-2xl font-semibold">{formatINR(Number(project?.totalQuote || 0))}</p></Card>
        <Card><CardLabel>Paid So Far</CardLabel><p className="text-2xl font-semibold text-green-600">{formatINR(Number(project?.amountPaid || 0))}</p></Card>
      </div>

      <Card className="mt-4 divide-y divide-black/5 p-0">
        {installments.length === 0 && (
          <p className="p-5 text-sm text-ink/50">No installments scheduled yet.</p>
        )}
        {installments.map((row) => (
          <div key={row.id} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-ink">{row.label}</p>
              <p className="text-xs text-ink/40">Due {formatDate(row.dueDate.toISOString())}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-ink">{formatINR(Number(row.amount))}</p>
              <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
