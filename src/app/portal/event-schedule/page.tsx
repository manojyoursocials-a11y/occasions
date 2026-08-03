import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import { MapPin, Clock } from "lucide-react";

export default async function EventSchedulePage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const items = project
    ? await prisma.eventScheduleItem.findMany({
        where: { projectId: project.id },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Event Schedule</h1>
      <p className="mt-1 text-sm text-ink/50">Every function, in order</p>

      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <Card><p className="text-sm text-ink/50">Your schedule isn&apos;t published yet.</p></Card>
        )}
        {items.map((item) => (
          <Card key={item.id}>
            <CardLabel>{formatDate(item.eventDate.toISOString())}</CardLabel>
            <p className="text-base font-semibold text-ink">{item.title}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink/50">
              {item.startTime && (
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {item.startTime}</span>
              )}
              {item.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {item.location}</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
