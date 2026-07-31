/**
 * Related meetings for Client CRM (Project 054).
 */

import { listMeetingsByClient } from "@/core/meeting/meeting";
import type { Client } from "@/core/types";
import {
  toMeetingWorkspaceModel,
  type MeetingWorkspaceModel,
} from "@/features/meeting/lib/meeting-types";

export async function listClientRelatedMeetings(
  workspaceId: string,
  companyId: string,
  client: Client,
): Promise<MeetingWorkspaceModel[]> {
  const meetings = await listMeetingsByClient(
    workspaceId,
    companyId,
    client.id,
  );
  return meetings.map((meeting) =>
    toMeetingWorkspaceModel(meeting, {
      clientName: client.name,
      projectName: null,
    }),
  );
}
