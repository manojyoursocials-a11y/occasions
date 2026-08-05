"use client";

import { useState, useTransition } from "react";
import { verifyClientAccess } from "@/lib/actions/client-share";
import { formatINR, formatDate, daysUntil } from "@/lib/utils";
import { Lock, Clock, MapPin } from "lucide-react";

// `Extract` distributes over the union properly (a bare conditional here
// would not, since the checked type isn't a generic type parameter) —
// this pulls out just the `{ ok: true; project: ... }` branch's project shape.
type VerifyResult = Awaited<ReturnType<typeof verifyClientAccess>>;
type ProjectData = Extract<VerifyResult, { ok: true }>["project"];

export default function ClientShareGatePage({ params }: { params: { token: string } }) {
  const token = params.token;
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyClientAccess(token, pin);
      if (!result.ok) {
        setError("Incorrect PIN. Please check with your planner and try again.");
        return;
      }
      setProject(result.project);
    });
  }

  if (project) {
    const paidPct = project.totalQuote ? Math.round((project.amountPaid / project.totalQuote) * 100) : 0;
    return (
      <div className="min-h-screen bg-surface px-4 py-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-ink">{project.title}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {project.eventType} · {formatDate(project.eventDateISO)}
            {project.venue ? ` · ${project.venue}` : ""}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Total Quote</p>
              <p className="text-2xl font-semibold text-ink">{formatINR(project.totalQuote)}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(paidPct, 100)}%` }} />
              </div>
              <p className="mt-1.5 text-sm font-medium text-green-600">{formatINR(project.amountPaid)} paid</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink/40">Event Countdown</p>
              <p className="text-2xl font-semibold text-ink">{Math.max(daysUntil(project.eventDateISO), 0)}</p>
              <p className="text-sm text-ink/50">days to go</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">Payment Schedule</p>
            <div className="divide-y divide-black/5">
              {project.installments.length === 0 && <p className="text-sm text-ink/50">No installments yet.</p>}
              {project.installments.map((i) => (
                <div key={i.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{i.label}</p>
                    <p className="text-xs text-ink/40">Due {formatDate(i.dueDateISO)}</p>
                  </div>
                  <p className="text-sm font-semibold text-ink">{formatINR(i.amount)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">Event Schedule</p>
            <div className="space-y-2">
              {project.schedule.length === 0 && <p className="text-sm text-ink/50">Not published yet.</p>}
              {project.schedule.map((s) => (
                <div key={s.id} className="rounded-lg bg-surface px-3 py-2.5">
                  <p className="text-sm font-medium text-ink">{s.title}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink/50">
                    <span>{formatDate(s.eventDateISO)}</span>
                    {s.startTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.startTime}</span>}
                    {s.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 bg-white p-6 text-center shadow-card">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900 text-white">
          <Lock className="h-4 w-4" />
        </div>
        <h1 className="text-lg font-semibold text-ink">Enter your PIN</h1>
        <p className="mt-1 text-sm text-ink/50">Your planner shared a PIN along with this link.</p>

        <form onSubmit={handleSubmit} className="mt-5">
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputMode="numeric"
            maxLength={4}
            placeholder="000"
            className="focus-ring w-full rounded-xl border border-black/10 px-3 py-2.5 text-center text-lg tracking-[0.5em]"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="focus-ring mt-4 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-50"
          >
            {isPending ? "Checking…" : "View Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
