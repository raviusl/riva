/**
 * Related meetings for Vendor CRM (Project 054).
 */

import { listMeetingsByVendor } from "@/core/meeting/meeting";
import type { Vendor } from "@/core/types";
import {
  toMeetingWorkspaceModel,
  type MeetingWorkspaceModel,
} from "@/features/meeting/lib/meeting-types";

export async function listVendorRelatedMeetings(
  workspaceId: string,
  companyId: string,
  vendor: Vendor,
): Promise<MeetingWorkspaceModel[]> {
  const meetings = await listMeetingsByVendor(
    workspaceId,
    companyId,
    vendor.id,
  );
  return meetings.map((meeting) =>
    toMeetingWorkspaceModel(meeting, {
      vendorNames: [vendor.name],
      projectName: null,
    }),
  );
}
