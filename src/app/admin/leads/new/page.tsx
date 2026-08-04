import Link from "next/link";
import { createLead } from "@/lib/actions/leads";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/leads" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Enquiries
      </Link>
      <h1 className="text-2xl font-semibold text-ink">New Enquiry</h1>
      <p className="mt-1 text-sm text-ink/50">Capture a lead the moment it comes in</p>

      <Card className="mt-6">
        <form action={createLead}>
          <Field label="Couple / Client name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required placeholder="e.g. Priya & Arjun" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" placeholder="priya@example.com" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" placeholder="+91 98765 43210" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Event type" htmlFor="eventType">
              <Select id="eventType" name="eventType" defaultValue="Wedding">
                <option>Wedding</option>
                <option>Engagement</option>
                <option>Pre-Wedding Shoot</option>
                <option>Reception</option>
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Event date" htmlFor="eventDate">
              <Input id="eventDate" name="eventDate" type="date" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget range" htmlFor="budgetRange">
              <Input id="budgetRange" name="budgetRange" placeholder="₹1,00,000 – ₹2,00,000" />
            </Field>
            <Field label="Indicative quote (₹)" htmlFor="quoteAmount">
              <Input id="quoteAmount" name="quoteAmount" type="number" placeholder="150000" />
            </Field>
          </div>

          <Field label="Source" htmlFor="source">
            <Select id="source" name="source" defaultValue="landing_page">
              <option value="landing_page">Landing Page</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone_call">Phone Call</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <Field label="Notes" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Anything discussed so far…" />
          </Field>

          <Button type="submit" className="w-full">Save Enquiry</Button>
        </form>
      </Card>
    </div>
  );
}
