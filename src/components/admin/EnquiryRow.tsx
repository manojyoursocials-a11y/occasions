"use client";

import { useState } from "react";
import Link from "next/link";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteLead } from "@/lib/actions/leads";
import { ChevronDown, Pencil } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface EnquiryRowData {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  eventType: string | null;
  eventDateISO: string | null;
  budgetRange: string | null;
  quoteAmount: number | null;
  source: string;
  status: string;
  notes: string | null;
  createdAtISO: string;
}

export function EnquiryRow({ lead, canDelete }: { lead: EnquiryRowData; canDelete: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="cursor-pointer hover:bg-black/[0.02]" onClick={() => setOpen((v) => !v)}>
        <td className="px-5 py-3 text-ink/60">{formatDate(lead.createdAtISO)}</td>
        <td className="px-5 py-3 font-medium text-ink">
          <span className="flex items-center gap-1.5">
            <ChevronDown className={`h-3.5 w-3.5 text-ink/30 transition-transform ${open ? "rotate-180" : ""}`} />
            {lead.fullName}
          </span>
        </td>
        <td className="px-5 py-3 text-ink/60">{lead.phone || lead.email || "—"}</td>
        <td className="px-5 py-3 text-ink/60">
          {lead.eventType || "—"}{lead.eventDateISO ? ` · ${formatDate(lead.eventDateISO)}` : ""}
        </td>
        <td className="px-5 py-3 text-ink/60">{lead.budgetRange || (lead.quoteAmount ? `₹${lead.quoteAmount}` : "—")}</td>
        <td className="px-5 py-3 text-ink/60">{lead.source}</td>
        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
          <LeadStatusSelect leadId={lead.id} status={lead.status} />
        </td>
        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
          {(lead.status === "quoted" || lead.status === "won") && (
            <Link
              href={`/admin/clients/new?leadId=${lead.id}&fullName=${encodeURIComponent(lead.fullName)}&email=${encodeURIComponent(lead.email || "")}&eventType=${encodeURIComponent(lead.eventType || "Wedding")}&eventDate=${lead.eventDateISO ? lead.eventDateISO.slice(0, 10) : ""}`}
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Convert to Project →
            </Link>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-surface">
          <td colSpan={8} className="px-5 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
              Enquiry Details — {lead.fullName}
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <p className="text-xs text-ink/40">Email</p>
                <p className="text-ink/80">{lead.email || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40">Phone</p>
                <p className="text-ink/80">{lead.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40">Indicative quote</p>
                <p className="text-ink/80">{lead.quoteAmount ? `₹${lead.quoteAmount}` : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-ink/40">Source</p>
                <p className="text-ink/80">{lead.source}</p>
              </div>
            </div>
            {lead.notes && (
              <div className="mt-3">
                <p className="text-xs text-ink/40">Notes</p>
                <p className="text-sm text-ink/80">{lead.notes}</p>
              </div>
            )}
            <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-3">
              <Link
                href={`/admin/leads/${lead.id}/edit`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink/60 hover:bg-black/5"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Link>
              {canDelete && (
                <DeleteButton
                  action={deleteLead.bind(null, lead.id)}
                  confirmMessage={`Delete the enquiry from ${lead.fullName}? This can't be undone.`}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
