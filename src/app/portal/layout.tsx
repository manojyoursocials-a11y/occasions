import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { formatDate } from "@/lib/utils";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");

  const [user, project] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.project.findFirst({
      where: { clientId: session.user.id },
      orderBy: { eventDate: "asc" },
    }),
  ]);

  return (
    <div className="flex">
      <PortalSidebar
        companyName={user?.companyName || "The Occasions Event Planners"}
        projectTitle={project?.title || "No project yet"}
        eventLabel={project?.eventType || "Event"}
        eventDate={project ? formatDate(project.eventDate.toISOString()) : "—"}
        contractSigned={project?.contractStatus === "signed"}
      />
      <main className="min-h-screen flex-1 bg-surface px-8 py-8">{children}</main>
    </div>
  );
}
