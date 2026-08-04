import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";
import { createInstallment } from "@/lib/actions/payments";
import { formatINR, formatDate } from "@/lib/utils";

const TONE = { pending: "gray", due_soon: "amber", overdue: "red", paid: "green" } as const;

export default async function AdminPaymentsPage() {
  const [installments, projects] = await Promise.all([
    prisma.paymentInstallment.findMany({
      include: { project: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
  ]);

  const totalCollected = installments
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  const totalOutstanding = installments
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Finances</h1>
      <p className="mt-1 text-sm text-ink/50">Get paid on your terms — every installment, one place</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40">Collected</p>
          <p className="text-2xl font-semibold text-green-600">{formatINR(totalCollected)}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-ink/40">Outstanding</p>
          <p className="text-2xl font-semibold text-ink">{formatINR(totalOutstanding)}</p>
        </Card>
      </div>

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
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={TONE[row.status]}>{row.status}</Badge>
                    {row.status !== "paid" && <MarkPaidButton installmentId={row.id} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="mt-4">
        <p className="mb-3 text-sm font-semibold text-ink">Add Installment</p>
        <form action={createInstallment} className="flex flex-wrap items-center gap-2">
          <Select name="projectId" required className="w-auto flex-1">
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </Select>
          <Input name="label" placeholder="Label (e.g. Advance)" className="w-auto flex-1" required />
          <Input name="amount" type="number" placeholder="Amount" className="w-auto" required />
          <Input name="dueDate" type="date" className="w-auto" required />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>
    </div>
  );
}
