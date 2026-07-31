import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { getMeetingById } from "@/core/meeting/meeting";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { EditMeetingForm } from "@/features/meeting/components/edit-meeting-form";
import { listMeetingOwnerOptions } from "@/features/meeting/lib/meeting-owners";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMeetingPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("meeting.write")) {
    redirect("/dashboard/meetings");
  }

  let meeting;
  try {
    meeting = await getMeetingById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  if (meeting.status === "cancelled") {
    redirect(`/dashboard/meetings/${meeting.id}`);
  }

  const [projects, clients, vendors, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
    listMeetingOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={`/dashboard/meetings/${meeting.id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.meetings)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editMeeting}</h1>
        <p className="mt-2 text-sm text-white/45">
          {uiZh.updateMeetingFor(meeting.title)}
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditMeetingForm
          meeting={meeting}
          projects={projects}
          clients={clients}
          vendors={vendors}
          owners={owners}
        />
      </div>
    </div>
  );
}
