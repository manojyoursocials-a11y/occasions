import Link from "next/link";
import { headers } from "next/headers";
import { getLandingPageSettings, updateLandingPageSettings } from "@/lib/actions/landing-page";
import { Card, CardLabel } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/admin/CopyButton";
import { ExternalLink } from "lucide-react";

export default async function LandingPageSettingsPage() {
  const settings = await getLandingPageSettings();
  const hdrs = await headers();
  const host = hdrs.get("host") || "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const publicUrl = `${protocol}://${host}/enquire`;

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Enquiries</h1>
        <p className="mt-1 text-sm text-ink/50">Landing page · leads · analytics · integrations</p>
      </div>

      {/* Sub-tabs */}
      <div className="mt-4 flex gap-1 border-b border-black/5">
        <Link href="/admin/leads" className="px-3 py-2 text-sm text-ink/50 hover:text-ink/70">
          Enquiries
        </Link>
        <div className="border-b-2 border-brand-700 px-3 py-2 text-sm font-medium text-brand-800">
          Landing Page
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <Card>
            <CardLabel>Your Public Enquiry Link</CardLabel>
            <div className="flex items-center gap-2">
              <Input value={publicUrl} readOnly className="flex-1 bg-surface" />
              <CopyButton text={publicUrl} />
              <a href="/enquire" target="_blank">
                <Button type="button" variant="secondary">
                  <ExternalLink className="h-4 w-4" /> Preview
                </Button>
              </a>
            </div>
          </Card>

          <Card className="mt-4">
            <CardLabel>Page Text</CardLabel>
            <form action={updateLandingPageSettings}>
              <Field label="Headline" htmlFor="heading">
                <Input id="heading" name="heading" defaultValue={settings.heading} />
              </Field>
              <Field label="Subtext" htmlFor="subheading">
                <Input id="subheading" name="subheading" defaultValue={settings.subheading} />
              </Field>
              <Field label="Cover image URL (optional)" htmlFor="coverImageUrl">
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  placeholder="https://…"
                  defaultValue={settings.coverImageUrl || ""}
                />
              </Field>
              <p className="mb-4 text-xs text-ink/40">
                Direct file upload isn't wired up yet — paste a hosted image URL for now (e.g.
                from Google Drive, Imgur, or your website).
              </p>
              <Button type="submit">Save Changes</Button>
            </form>
          </Card>
        </div>

        {/* Live preview */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Preview</p>
          <div className="overflow-hidden rounded-2xl border border-black/5 shadow-card">
            {settings.coverImageUrl && (
              <img src={settings.coverImageUrl} alt="" className="h-32 w-full object-cover" />
            )}
            {!settings.coverImageUrl && <div className="h-24 bg-gradient-to-br from-brand-100 to-brand-200" />}
            <div className="bg-white p-5">
              <p className="text-lg font-semibold text-ink">{settings.heading}</p>
              <p className="mt-1 text-sm text-ink/50">{settings.subheading}</p>
              <div className="mt-4 space-y-2">
                {["Name", "Contact", "Event Details", "Location / Venue", "Number of Guests", "Budget"].map((f) => (
                  <div key={f} className="rounded-lg border border-black/10 px-3 py-2 text-sm text-ink/30">
                    {f}
                  </div>
                ))}
                <div className="rounded-lg bg-brand-700 py-2.5 text-center text-sm font-medium text-white">
                  Submit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
