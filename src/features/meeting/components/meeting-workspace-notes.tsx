"use client";

import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";

type MeetingWorkspaceNotesProps = {
  initialNotes: string;
};

/** Editable notes layout — persistence deferred (no server actions in this pass). */
export function MeetingWorkspaceNotes({
  initialNotes,
}: MeetingWorkspaceNotesProps) {
  const [notes, setNotes] = useState(initialNotes);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.notes}</h2>
        <p className="mt-1 text-xs text-white/45">{uiZh.notesDraftDesc}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={14}
          placeholder={uiZh.writeMeetingNotes}
          className="min-h-[280px] resize-y border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/30"
        />
        <p className="mt-3 text-xs text-white/35">{uiZh.localDraftOnly}</p>
      </div>
    </section>
  );
}
