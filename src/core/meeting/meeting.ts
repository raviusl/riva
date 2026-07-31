import "server-only";

import { getClientById } from "@/core/client/client";
import { getCompanyById } from "@/core/company/company";
import {
  assertCompanyBoundary,
  requireCompany,
} from "@/core/company-isolation";
import { CoreError } from "@/core/errors";
import { EDITABLE_MEETING_STATUSES } from "@/core/meeting/constants";
import { recordMeetingAudit } from "@/core/meeting/audit";
import {
  findMeetingById,
  findMeetingsByClient,
  findMeetingsByCompany,
  findMeetingsByProject,
  findMeetingsByVendor,
  insertMeeting,
  updateMeetingById,
} from "@/core/meeting/repository";
import {
  createMeetingSchema,
  meetingIdSchema,
  updateMeetingSchema,
  type CreateMeetingInput,
  type MeetingIdInput,
  type UpdateMeetingInput,
} from "@/core/meeting/schema";
import type { Meeting, MeetingStatus } from "@/core/meeting/types";
import { getProjectById } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { getWorkspaceById } from "@/core/workspace/workspace";

export type { CreateMeetingInput, UpdateMeetingInput, MeetingIdInput };

function assertEditable(meeting: Meeting): void {
  if (!EDITABLE_MEETING_STATUSES.includes(meeting.status)) {
    throw new CoreError(
      "MEETING_NOT_EDITABLE",
      "Cancelled meetings cannot be edited.",
    );
  }
}

async function assertCompanyInWorkspace(
  workspaceId: string,
  companyId: string,
): Promise<string> {
  const scopedCompanyId = requireCompany(companyId);
  const company = await getCompanyById(scopedCompanyId, workspaceId);
  if (company.workspace_id !== workspaceId) {
    throw new CoreError(
      "COMPANY_WORKSPACE_MISMATCH",
      "Company does not belong to this workspace.",
    );
  }
  return scopedCompanyId;
}

async function assertProjectInCompany(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<void> {
  const project = await getProjectById(projectId, workspaceId);
  if (project.company_id !== companyId || project.workspace_id !== workspaceId) {
    throw new CoreError(
      "PROJECT_SCOPE_MISMATCH",
      "Project does not belong to this company.",
    );
  }
}

async function assertClientInCompany(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<void> {
  await getClientById(clientId, workspaceId, companyId);
}

async function assertVendorsInCompany(
  workspaceId: string,
  companyId: string,
  vendorIds: string[],
): Promise<void> {
  for (const vendorId of vendorIds) {
    await getVendorById(vendorId, workspaceId, companyId);
  }
}

function assertMeetingCompanyScope(meeting: Meeting, companyId: string): void {
  assertCompanyBoundary(companyId, meeting.company_id);
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Build starts_at ISO from meeting_date (YYYY-MM-DD) + meeting_time (HH:MM). */
export function buildMeetingStartsAt(
  meetingDate: string,
  meetingTime: string,
): string {
  return new Date(`${meetingDate}T${meetingTime}:00`).toISOString();
}

export type MeetingMutationContext = {
  actorId: string;
};

export async function createMeeting(
  input: CreateMeetingInput,
  context?: MeetingMutationContext,
): Promise<Meeting> {
  const values = createMeetingSchema.parse(input);
  await getWorkspaceById(values.workspaceId);
  const companyId = await assertCompanyInWorkspace(
    values.workspaceId,
    values.companyId,
  );

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }
  if (values.clientId) {
    await assertClientInCompany(
      values.workspaceId,
      companyId,
      values.clientId,
    );
  }
  const vendorIds = values.vendorIds ?? [];
  if (vendorIds.length > 0) {
    await assertVendorsInCompany(values.workspaceId, companyId, vendorIds);
  }

  try {
    const meeting = await insertMeeting(
      {
        workspace_id: values.workspaceId,
        company_id: companyId,
        project_id: values.projectId ?? null,
        client_id: values.clientId ?? null,
        owner_id: values.ownerId ?? null,
        title: values.title.trim(),
        meeting_type: values.meetingType ?? "other",
        status: values.status ?? "scheduled",
        meeting_date: values.meetingDate,
        meeting_time: values.meetingTime,
        duration_minutes: values.durationMinutes ?? 60,
        starts_at: buildMeetingStartsAt(values.meetingDate, values.meetingTime),
        location: emptyToNull(values.location),
        google_meet_link: emptyToNull(values.googleMeetLink),
        notes: emptyToNull(values.notes),
        internal_notes: emptyToNull(values.internalNotes),
        participants: values.participants ?? [],
        created_by: values.createdBy,
      },
      vendorIds,
    );

    if (context?.actorId) {
      recordMeetingAudit({
        action: "create",
        actorId: context.actorId,
        before: null,
        after: meeting,
      });
    }

    return meeting;
  } catch (error) {
    console.error("createMeeting failed", error);
    throw new CoreError("MEETING_CREATE_FAILED", "Failed to create meeting.");
  }
}

export async function getMeetingById(
  meetingId: string,
  workspaceId?: string,
  companyId?: string,
): Promise<Meeting> {
  try {
    const meeting = await findMeetingById(meetingId, workspaceId);
    if (!meeting) {
      throw new CoreError("MEETING_NOT_FOUND", "Meeting not found.");
    }
    if (companyId) {
      assertMeetingCompanyScope(meeting, companyId);
    }
    return meeting;
  } catch (error) {
    if (error instanceof CoreError) {
      throw error;
    }
    console.error("getMeetingById failed", error);
    throw new CoreError("MEETING_LOAD_FAILED", "Failed to load meeting.");
  }
}

export async function listMeetingsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Meeting[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );

  try {
    return await findMeetingsByCompany(workspaceId, scopedCompanyId);
  } catch (error) {
    console.error("listMeetingsByCompany failed", error);
    throw new CoreError("MEETING_LIST_FAILED", "Failed to list meetings.");
  }
}

export async function listMeetingsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Meeting[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );
  await assertProjectInCompany(workspaceId, scopedCompanyId, projectId);

  try {
    return await findMeetingsByProject(
      workspaceId,
      scopedCompanyId,
      projectId,
    );
  } catch (error) {
    console.error("listMeetingsByProject failed", error);
    throw new CoreError("MEETING_LIST_FAILED", "Failed to list meetings.");
  }
}

export async function listMeetingsByClient(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<Meeting[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );
  await assertClientInCompany(workspaceId, scopedCompanyId, clientId);

  try {
    return await findMeetingsByClient(workspaceId, scopedCompanyId, clientId);
  } catch (error) {
    console.error("listMeetingsByClient failed", error);
    throw new CoreError("MEETING_LIST_FAILED", "Failed to list meetings.");
  }
}

export async function listMeetingsByVendor(
  workspaceId: string,
  companyId: string,
  vendorId: string,
): Promise<Meeting[]> {
  await getWorkspaceById(workspaceId);
  const scopedCompanyId = await assertCompanyInWorkspace(
    workspaceId,
    companyId,
  );
  await getVendorById(vendorId, workspaceId, scopedCompanyId);

  try {
    return await findMeetingsByVendor(workspaceId, scopedCompanyId, vendorId);
  } catch (error) {
    console.error("listMeetingsByVendor failed", error);
    throw new CoreError("MEETING_LIST_FAILED", "Failed to list meetings.");
  }
}

export async function updateMeeting(
  input: UpdateMeetingInput,
  context?: MeetingMutationContext,
): Promise<Meeting> {
  const values = updateMeetingSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getMeetingById(
    values.meetingId,
    values.workspaceId,
    companyId,
  );

  assertEditable(before);

  if (values.projectId) {
    await assertProjectInCompany(
      values.workspaceId,
      companyId,
      values.projectId,
    );
  }
  if (values.clientId) {
    await assertClientInCompany(
      values.workspaceId,
      companyId,
      values.clientId,
    );
  }
  if (values.vendorIds) {
    await assertVendorsInCompany(
      values.workspaceId,
      companyId,
      values.vendorIds,
    );
  }

  const nextStatus: MeetingStatus = values.status ?? before.status;

  try {
    const meeting = await updateMeetingById(
      before.id,
      {
        title: values.title.trim(),
        meeting_type: values.meetingType ?? before.meeting_type,
        status: nextStatus,
        meeting_date: values.meetingDate,
        meeting_time: values.meetingTime,
        duration_minutes: values.durationMinutes ?? before.duration_minutes,
        starts_at: buildMeetingStartsAt(values.meetingDate, values.meetingTime),
        location:
          values.location !== undefined
            ? emptyToNull(values.location)
            : before.location,
        google_meet_link:
          values.googleMeetLink !== undefined
            ? emptyToNull(values.googleMeetLink)
            : before.google_meet_link,
        project_id:
          values.projectId !== undefined
            ? values.projectId
            : before.project_id,
        client_id:
          values.clientId !== undefined ? values.clientId : before.client_id,
        owner_id:
          values.ownerId !== undefined ? values.ownerId : before.owner_id,
        notes:
          values.notes !== undefined
            ? emptyToNull(values.notes)
            : before.notes,
        internal_notes:
          values.internalNotes !== undefined
            ? emptyToNull(values.internalNotes)
            : before.internal_notes,
        participants: values.participants ?? before.participants,
      },
      values.vendorIds,
    );

    if (context?.actorId) {
      recordMeetingAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: meeting,
      });
    }

    return meeting;
  } catch (error) {
    console.error("updateMeeting failed", error);
    throw new CoreError("MEETING_UPDATE_FAILED", "Failed to update meeting.");
  }
}

export async function cancelMeeting(
  input: MeetingIdInput,
  context?: MeetingMutationContext,
): Promise<Meeting> {
  const values = meetingIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getMeetingById(
    values.meetingId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "cancelled") {
    return before;
  }

  try {
    const meeting = await updateMeetingById(before.id, {
      status: "cancelled",
    });

    if (context?.actorId) {
      recordMeetingAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: meeting,
        metadata: { reason: "cancel" },
      });
    }

    return meeting;
  } catch (error) {
    console.error("cancelMeeting failed", error);
    throw new CoreError("MEETING_CANCEL_FAILED", "Failed to cancel meeting.");
  }
}

export async function completeMeeting(
  input: MeetingIdInput,
  context?: MeetingMutationContext,
): Promise<Meeting> {
  const values = meetingIdSchema.parse(input);
  const companyId = requireCompany(values.companyId);
  const before = await getMeetingById(
    values.meetingId,
    values.workspaceId,
    companyId,
  );

  if (before.status === "cancelled") {
    throw new CoreError(
      "MEETING_NOT_EDITABLE",
      "Cancelled meetings cannot be completed.",
    );
  }
  if (before.status === "completed") {
    return before;
  }

  try {
    const meeting = await updateMeetingById(before.id, {
      status: "completed",
    });

    if (context?.actorId) {
      recordMeetingAudit({
        action: "update",
        actorId: context.actorId,
        before,
        after: meeting,
        metadata: { reason: "complete" },
      });
    }

    return meeting;
  } catch (error) {
    console.error("completeMeeting failed", error);
    throw new CoreError(
      "MEETING_COMPLETE_FAILED",
      "Failed to complete meeting.",
    );
  }
}
