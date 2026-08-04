import { getLandingPageSettings, submitPublicEnquiry } from "@/lib/actions/landing-page";
import { CheckCircle2 } from "lucide-react";

export default async function PublicEnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const settings = await getLandingPageSettings();
  const { submitted } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card">
        {settings.coverImageUrl ? (
          <img src={settings.coverImageUrl} alt="" className="h-40 w-full object-cover" />
        ) : (
          <div className="h-32 bg-gradient-to-br from-brand-200 to-brand-500" />
        )}

        <div className="p-6">
          {submitted ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
              <p className="mt-3 text-lg font-semibold text-ink">Thank you!</p>
              <p className="mt-1 text-sm text-ink/50">
                We've received your enquiry and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-ink">{settings.heading}</h1>
              <p className="mt-1 text-sm text-ink/50">{settings.subheading}</p>

              <form action={submitPublicEnquiry} className="mt-5 space-y-3">
                <input
                  name="fullName"
                  required
                  placeholder="Name"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <input
                  name="phone"
                  placeholder="Contact"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <input
                  name="eventDetails"
                  placeholder="Event Details"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <input
                  name="venue"
                  placeholder="Location / Venue"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <input
                  name="guests"
                  placeholder="Number of Guests"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <input
                  name="budget"
                  placeholder="Budget"
                  className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
                <button
                  type="submit"
                  className="focus-ring w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800"
                >
                  Submit
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
