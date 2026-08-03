import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DocumentsPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const docs = project
    ? await prisma.document.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Documents</h1>
      <p className="mt-1 text-sm text-ink/50">Shared files for your event</p>

      <Card className="mt-6 divide-y divide-black/5 p-0">
        {docs.length === 0 && <p className="p-5 text-sm text-ink/50">No documents shared yet.</p>}
        {docs.map((doc) => (
          <a key={doc.id} href={doc.fileUrl} target="_blank" className="flex items-center gap-3 px-5 py-4 hover:bg-black/[0.02]">
            <FileText className="h-4 w-4 text-ink/40" />
            <div>
              <p className="text-sm font-medium text-ink">{doc.name}</p>
              <p className="text-xs text-ink/40">{formatDate(doc.createdAt.toISOString())}</p>
            </div>
          </a>
        ))}
      </Card>
    </div>
  );
}
