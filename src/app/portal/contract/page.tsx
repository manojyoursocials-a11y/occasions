import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default async function ContractPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const contract = project
    ? await prisma.contract.findUnique({ where: { projectId: project.id } })
    : null;

  const signed = project?.contractStatus === "signed";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Contract</h1>
      <p className="mt-1 text-sm text-ink/50">Review and sign your service agreement</p>

      <Card className="mt-6">
        <CardLabel>Status</CardLabel>
        <p className={`text-lg font-semibold ${signed ? "text-green-600" : "text-red-600"}`}>
          {signed ? "Signed" : "Unsigned"}
        </p>
        {contract?.sentAt && (
          <p className="mt-1 text-sm text-ink/50">Sent {formatDate(contract.sentAt.toISOString())}</p>
        )}
        {contract?.fileUrl ? (
          <a href={contract.fileUrl} target="_blank" className="mt-4 inline-block text-sm text-brand-700 underline">
            View contract document →
          </a>
        ) : (
          <p className="mt-4 text-sm text-ink/40">Your planner hasn&apos;t uploaded the contract yet.</p>
        )}

        {!signed && contract?.fileUrl && (
          <Button className="mt-6">Review &amp; Sign</Button>
        )}
      </Card>
    </div>
  );
}
