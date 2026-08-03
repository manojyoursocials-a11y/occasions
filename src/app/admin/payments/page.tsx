import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

const TONE = { pending: "gray", due_soon: "amber", overdue: "red", paid: "green" } as const;

export default async function AdminPaymentsPage() {
  const installments = await prisma.paymentInstallment.findMany({
    include: { project: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Payments</h1>
      <p className="mt-1 text-sm text-ink/50">Every installment across every project</p>

      <Card className="mt-6 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Installment</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {installments.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/50">No payment schedules yet.</td></tr>
            )}
            {installments.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-3 font-medium text-ink">{row.project.title}</td>
                <td className="px-5 py-3 text-ink/60">{row.label}</td>
                <td className="px-5 py-3 text-ink/60">{formatINR(Number(row.amount))}</td>
                <td className="px-5 py-3 text-ink/60">{formatDate(row.dueDate.toISOString())}</td>
                <td className="px-5 py-3"><Badge tone={TONE[row.status]}>{row.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
