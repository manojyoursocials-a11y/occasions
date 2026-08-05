import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateLead } from "@/lib/actions/leads";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const updateLeadWithId = updateLead.bind(null, lead.id);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Enquiries
      </Link>
      <h1 className="text-2xl font-semibold text-ink">Edit Enquiry</h1>
      <p className="mt-1 text-sm text-ink/50">{lead.fullName}</p>

      <Card className="mt-6">
        <form action={updateLeadWithId}>
          <Field label="Couple / Client name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required defaultValue={lead.fullName} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={lead.email || ""} />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={lead.phone || ""} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Event type" htmlFor="eventType">
              <Select id="eventType" name="eventType" defaultValue={lead.eventType || "Wedding"}>
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Pre-Wedding Shoot</option>
                <option>Reception</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Event date" htmlFor="eventDate">
              <Input id="eventDate" name="eventDate" type="date" defaultValue={lead.eventDate ? lead.eventDate.toISOString().slice(0, 10) : ""} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget range" htmlFor="budgetRange">
              <Input id="budgetRange" name="budgetRange" defaultValue={lead.budgetRange || ""} />
            </Field>
            <Field label="Indicative quote (₹)" htmlFor="quoteAmount">
              <Input id="quoteAmount" name="quoteAmount" type="number" defaultValue={lead.quoteAmount ? Number(lead.quoteAmount) : ""} />
            </Field>
          </div>

          <Field label="Source" htmlFor="source">
            <Select id="source" name="source" defaultValue={lead.source}>
              <option value="landing_page">Landing Page</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone_call">Phone Call</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={lead.notes || ""} />
          </Field>

          <Button type="submit" className="w-full">Save Changes</Button>
        </form>
      </Card>
    </div>
  );
}
