import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createProject } from "@/lib/actions/projects";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const clients = await prisma.user.findMany({
    where: { role: "client" },
    orderBy: { fullName: "asc" },
  });

  const prefillTitle = params.fullName || "";
  const prefillEmail = params.email || "";

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Projects
      </Link>
      <h1 className="text-2xl font-semibold text-ink">New Project</h1>
      <p className="mt-1 text-sm text-ink/50">Book a couple in and build their portal</p>

      <Card className="mt-6">
        <form action={createProject}>
          <Field label="Project title" htmlFor="title">
            <Input id="title" name="title" required defaultValue={prefillTitle} placeholder="e.g. Ananya & Karan" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Event type" htmlFor="eventType">
              <Select id="eventType" name="eventType" defaultValue={params.eventType || "Wedding"}>
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Pre-Wedding Shoot</option>
                <option>Reception</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Event date" htmlFor="eventDate">
              <Input id="eventDate" name="eventDate" type="date" required defaultValue={params.eventDate || ""} />
            </Field>
          </div>

          <Field label="Venue" htmlFor="venue">
            <Input id="venue" name="venue" placeholder="The Leela Palace, Chennai" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Total quote (₹)" htmlFor="totalQuote">
              <Input id="totalQuote" name="totalQuote" type="number" required placeholder="150000" />
            </Field>
            <Field label="Amount already paid (₹)" htmlFor="amountPaid">
              <Input id="amountPaid" name="amountPaid" type="number" defaultValue="0" />
            </Field>
          </div>

          <div className="mb-4 rounded-xl border border-black/10 p-4">
            <p className="mb-3 text-sm font-medium text-ink/80">Client</p>

            {clients.length > 0 && (
              <div className="mb-3">
                <label className="mb-1.5 flex items-center gap-2 text-sm text-ink/70">
                  <input type="radio" name="clientMode" value="existing" defaultChecked />
                  Use an existing client account
                </label>
                <Select name="existingClientId" defaultValue="">
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.email})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <label className="mb-2 flex items-center gap-2 text-sm text-ink/70">
              <input type="radio" name="clientMode" value="new" defaultChecked={clients.length === 0} />
              Create a new client account
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input name="newClientName" placeholder="Client full name" defaultValue={prefillTitle} />
              <Input name="newClientEmail" type="email" placeholder="client@example.com" defaultValue={prefillEmail} />
            </div>
            <p className="mt-2 text-xs text-ink/40">
              A temporary password is generated automatically — for now it's printed to the
              server console; wiring up an invite email is a good next step.
            </p>
          </div>

          <Button type="submit" className="w-full">Create Project</Button>
        </form>
      </Card>
    </div>
  );
}
