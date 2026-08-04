"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormField";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";
import { DeleteScheduleItemButton } from "@/components/admin/DeleteScheduleItemButton";
import { formatINR, formatDate } from "@/lib/utils";
import { assignTeamMember } from "@/lib/actions/team";
import { createInstallment } from "@/lib/actions/payments";
import { createScheduleItem } from "@/lib/actions/schedule";
import { Clock, MapPin } from "lucide-react";

const TABS = ["Overview", "Schedule", "Payments", "Team", "Deliverables", "Contract"] as const;
type Tab = (typeof TABS)[number];

const PAYMENT_TONE = { pending: "gray", due_soon: "amber", overdue: "red", paid: "green" } as const;

export interface ProjectTabsData {
  id: string;
  title: string;
  eventType: string;
  eventDateISO: string;
  venue: string | null;
  totalQuote: number;
  amountPaid: number;
  contractStatus: string;
  client: { fullName: string; email: string; phone: string | null } | null;
  installments: { id: string; label: string; amount: number; dueDateISO: string; status: string }[];
  assignments: { id: string; shootLabel: string | null; teamMember: { fullName: string; role: string } }[];
  deliverables: { id: string; title: string; status: string; editor: { fullName: string } | null }[];
  schedule: {
    id: string;
    title: string;
    eventDateISO: string;
    startTime: string | null;
    location: string | null;
  }[];
  contract: { fileUrl: string | null; sentAtISO: string | null; signedAtISO: string | null } | null;
  teamMembers: { id: string; fullName: string; role: string }[];
}

export function ProjectTabs({
  project,
  sendContractAction,
  markSignedAction,
}: {
  project: ProjectTabsData;
  sendContractAction: (formData: FormData) => Promise<void>;
  markSignedAction: () => Promise<void>;
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const signed = project.contractStatus === "signed";

  return (
    <div>
      <div className="mt-4 flex flex-wrap gap-1 border-b border-black/5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`focus-ring rounded-t-lg px-3 py-2 text-sm font-medium transition ${
              tab === t
                ? "border-b-2 border-brand-700 text-brand-800"
                : "text-ink/50 hover:text-ink/70"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "Overview" && (
          <Card>
            <CardLabel>Project Overview</CardLabel>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Project Name</p>
                <p className="text-sm font-medium text-ink">{project.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Project Type</p>
                <p className="text-sm font-medium text-ink">{project.eventType}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Client Name</p>
                <p className="text-sm font-medium text-ink">{project.client?.fullName || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Client Login Email</p>
                <p className="text-sm font-medium text-ink">{project.client?.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Venue</p>
                <p className="text-sm font-medium text-ink">{project.venue || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/40">Event Date</p>
                <p className="text-sm font-medium text-ink">{formatDate(project.eventDateISO)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-ink/40">
              Your client accesses this project by logging in at <code>/portal</code> with the
              email above — there's no separate share link, since access is account-based rather
              than a public token link.
            </p>
          </Card>
        )}

        {tab === "Schedule" && (
          <Card>
            <CardLabel>Event Schedule</CardLabel>
            <div className="space-y-2">
              {project.schedule.length === 0 && <p className="text-sm text-ink/50">No schedule items yet.</p>}
              {project.schedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink/50">
                      <span>{formatDate(item.eventDateISO)}</span>
                      {item.startTime && (
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.startTime}</span>
                      )}
                      {item.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                      )}
                    </div>
                  </div>
                  <DeleteScheduleItemButton itemId={item.id} projectId={project.id} />
                </div>
              ))}
            </div>
            <form action={createScheduleItem} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="projectId" value={project.id} />
              <Input name="title" placeholder="e.g. Reception" className="w-auto flex-1" required />
              <Input name="eventDate" type="date" className="w-auto" required />
              <Input name="startTime" type="time" className="w-auto" />
              <Input name="location" placeholder="Location" className="w-auto flex-1" />
              <Button type="submit" variant="secondary">Add</Button>
            </form>
          </Card>
        )}

        {tab === "Payments" && (
          <Card>
            <CardLabel>Payment Schedule</CardLabel>
            <div className="divide-y divide-black/5">
              {project.installments.length === 0 && <p className="py-2 text-sm text-ink/50">No installments scheduled.</p>}
              {project.installments.map((row) => (
                <div key={row.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{row.label}</p>
                    <p className="text-xs text-ink/40">Due {formatDate(row.dueDateISO)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink">{formatINR(row.amount)}</p>
                    {row.status === "paid" ? (
                      <Badge tone="green">Paid</Badge>
                    ) : (
                      <>
                        <Badge tone={PAYMENT_TONE[row.status as keyof typeof PAYMENT_TONE]}>{row.status}</Badge>
                        <MarkPaidButton installmentId={row.id} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <form action={createInstallment} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="projectId" value={project.id} />
              <Input name="label" placeholder="Label (e.g. Advance)" className="w-auto flex-1" required />
              <Input name="amount" type="number" placeholder="Amount" className="w-auto" required />
              <Input name="dueDate" type="date" className="w-auto" required />
              <Button type="submit" variant="secondary">Add Installment</Button>
            </form>
          </Card>
        )}

        {tab === "Team" && (
          <Card>
            <CardLabel>Team Assigned</CardLabel>
            <div className="space-y-2">
              {project.assignments.length === 0 && <p className="text-sm text-ink/50">No crew assigned yet.</p>}
              {project.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                  <div>
                    <span className="text-sm text-ink">{a.teamMember.fullName}</span>
                    {a.shootLabel && <span className="ml-2 text-xs text-ink/40">{a.shootLabel}</span>}
                  </div>
                  <Badge tone="brand">{a.teamMember.role}</Badge>
                </div>
              ))}
            </div>
            <form action={assignTeamMember} className="mt-3 flex flex-wrap items-center gap-2">
              <input type="hidden" name="projectId" value={project.id} />
              <Select name="teamMemberId" required className="w-auto flex-1">
                <option value="">Assign crew member…</option>
                {project.teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName} — {m.role}</option>
                ))}
              </Select>
              <Input name="shootLabel" placeholder="Shoot label (optional)" className="w-auto flex-1" />
              <Button type="submit" variant="secondary">Assign</Button>
            </form>
          </Card>
        )}

        {tab === "Deliverables" && (
          <Card>
            <CardLabel>Deliverables</CardLabel>
            <div className="space-y-2">
              {project.deliverables.length === 0 && <p className="text-sm text-ink/50">Nothing in post-production yet.</p>}
              {project.deliverables.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{d.title}</p>
                    <p className="text-xs text-ink/40">{d.editor?.fullName || "Unassigned editor"}</p>
                  </div>
                  <Badge tone="brand">{d.status.replace("_", " ")}</Badge>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink/40">
              Add or update deliverables from the <Link href="/admin/post-production" className="underline">Post Production</Link> page.
            </p>
          </Card>
        )}

        {tab === "Contract" && (
          <Card>
            <CardLabel>Contract</CardLabel>
            <div className="flex flex-wrap items-center gap-2">
              {!signed && !project.contract && (
                <form action={sendContractAction} className="flex flex-1 items-center gap-2">
                  <Input name="fileUrl" placeholder="Paste contract link (Drive, DocuSign, etc.)" className="flex-1" />
                  <Button type="submit" variant="secondary">Mark as Sent</Button>
                </form>
              )}
              {!signed && project.contract && (
                <form action={markSignedAction}>
                  <Button type="submit" variant="secondary">Mark Signed</Button>
                </form>
              )}
              {signed && (
                <p className="text-sm text-green-600">
                  Signed {project.contract?.signedAtISO ? formatDate(project.contract.signedAtISO) : ""}
                </p>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
