import Link from "next/link";
import { createTeamMember } from "@/lib/actions/team";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function NewTeamMemberPage() {
  return (
    <div className="mx-auto max-w-md">
      <Link href="/admin/team" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Team
      </Link>
      <h1 className="text-2xl font-semibold text-ink">New Team Member</h1>
      <p className="mt-1 text-sm text-ink/50">Add crew you can assign to shoots</p>

      <Card className="mt-6">
        <form action={createTeamMember}>
          <Field label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required placeholder="e.g. Rohan Mehta" />
          </Field>
          <Field label="Role" htmlFor="role">
            <Select id="role" name="role" defaultValue="photographer">
              <option value="photographer">Photographer</option>
              <option value="videographer">Videographer</option>
              <option value="editor">Editor</option>
              <option value="coordinator">Coordinator</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" placeholder="rohan@studio.com" />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" placeholder="+91 98765 43210" />
          </Field>
          <Button type="submit" className="w-full">Add Member</Button>
        </form>
      </Card>
    </div>
  );
}
