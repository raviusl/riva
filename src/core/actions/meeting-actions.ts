"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import {
  cancelMeeting,
  completeMeeting,
  createMeeting,
  updateMeeting,
} from "@/core/meeting/meeting";
import type {
  CreateMeetingInput,
  MeetingIdInput,
  UpdateMeetingInput,
} from "@/core/meeting/schema";
import { requireMembershipPermission } from "@/core/membership/memberships";

export type MeetingActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateMeetingPaths(meetingId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/meetings");
  if (meetingId) {
    revalidatePath(`/dashboard/meetings/${meetingId}`);
  }
}

async function requireMeetingWrite(
  userId: string,
  workspaceId: string,
  companyId: string,
) {
  await requireMembershipPermission(
    userId,
    workspaceId,
    companyId,
    "meeting.write",
  );
}

export async function createMeetingAction(
  input: Omit<CreateMeetingInput, "createdBy">,
): Promise<MeetingActionResult<{ meetingId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMeetingWrite(userId, input.workspaceId, input.companyId);
    const meeting = await createMeeting(
      { ...input, createdBy: userId },
      { actorId: userId },
    );
    revalidateMeetingPaths(meeting.id);
    return { ok: true, data: { meetingId: meeting.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to create meeting"),
    };
  }
}

export async function updateMeetingAction(
  input: UpdateMeetingInput,
): Promise<MeetingActionResult<{ meetingId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMeetingWrite(userId, input.workspaceId, input.companyId);
    const meeting = await updateMeeting(input, { actorId: userId });
    revalidateMeetingPaths(meeting.id);
    return { ok: true, data: { meetingId: meeting.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update meeting"),
    };
  }
}

export async function cancelMeetingAction(
  input: MeetingIdInput,
): Promise<MeetingActionResult<{ meetingId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMeetingWrite(userId, input.workspaceId, input.companyId);
    const meeting = await cancelMeeting(input, { actorId: userId });
    revalidateMeetingPaths(meeting.id);
    return { ok: true, data: { meetingId: meeting.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to cancel meeting"),
    };
  }
}

export async function completeMeetingAction(
  input: MeetingIdInput,
): Promise<MeetingActionResult<{ meetingId: string }>> {
  try {
    const userId = await requireSessionUserId();
    await requireMeetingWrite(userId, input.workspaceId, input.companyId);
    const meeting = await completeMeeting(input, { actorId: userId });
    revalidateMeetingPaths(meeting.id);
    return { ok: true, data: { meetingId: meeting.id } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to complete meeting"),
    };
  }
}
