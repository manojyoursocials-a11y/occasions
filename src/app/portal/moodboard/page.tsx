import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function MoodboardPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const items = project
    ? await prisma.moodboardItem.findMany({
        where: { projectId: project.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">Moodboard</h1>
      <p className="mt-1 text-sm text-ink/50">Visual references your planner has shared</p>

      {items.length === 0 ? (
        <Card className="mt-6"><p className="text-sm text-ink/50">No moodboard images yet — check back soon.</p></Card>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <figure key={item.id} className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-card">
              <img src={item.imageUrl} alt={item.caption || ""} className="aspect-square w-full object-cover" />
              {item.caption && <figcaption className="p-2 text-xs text-ink/50">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
