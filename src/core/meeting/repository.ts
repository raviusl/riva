import "server-only";

import type { MeetingStatus, MeetingType } from "@/core/meeting/constants";
import type { Meeting, MeetingParticipant } from "@/core/meeting/types";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

function parseParticipants(value: unknown): MeetingParticipant[] {
  if (!Array.isArray(value)) return [];
  const participants: MeetingParticipant[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.name !== "string") continue;
    participants.push({
      id: row.id,
      name: row.name,
      ...(typeof row.role === "string" ? { role: row.role } : {}),
      ...(typeof row.email === "string" ? { email: row.email } : {}),
    });
  }
  return participants;
}

export function mapMeetingRow(
  data: Record<string, unknown>,
  vendorIds: string[] = [],
): Meeting {
  return {
    id: data.id as string,
    workspace_id: data.workspace_id as string,
    company_id: data.company_id as string,
    project_id: (data.project_id as string | null | undefined) ?? null,
    client_id: (data.client_id as string | null | undefined) ?? null,
    owner_id: (data.owner_id as string | null | undefined) ?? null,
    title: data.title as string,
    meeting_type: data.meeting_type as MeetingType,
    status: data.status as MeetingStatus,
    meeting_date: data.meeting_date as string,
    meeting_time: data.meeting_time as string,
    duration_minutes: Number(data.duration_minutes ?? 60),
    starts_at: data.starts_at as string,
    location: (data.location as string | null | undefined) ?? null,
    google_meet_link:
      (data.google_meet_link as string | null | undefined) ?? null,
    notes: (data.notes as string | null | undefined) ?? null,
    internal_notes: (data.internal_notes as string | null | undefined) ?? null,
    participants: parseParticipants(data.participants),
    vendor_ids: vendorIds,
    created_by: data.created_by as string,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

export type InsertMeetingRow = {
  workspace_id: string;
  company_id: string;
  project_id?: string | null;
  client_id?: string | null;
  owner_id?: string | null;
  title: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  meeting_date: string;
  meeting_time: string;
  duration_minutes: number;
  starts_at: string;
  location?: string | null;
  google_meet_link?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  participants?: MeetingParticipant[];
  created_by: string;
};

export type UpdateMeetingRow = {
  project_id?: string | null;
  client_id?: string | null;
  owner_id?: string | null;
  title?: string;
  meeting_type?: MeetingType;
  status?: MeetingStatus;
  meeting_date?: string;
  meeting_time?: string;
  duration_minutes?: number;
  starts_at?: string;
  location?: string | null;
  google_meet_link?: string | null;
  notes?: string | null;
  internal_notes?: string | null;
  participants?: MeetingParticipant[];
};

async function loadVendorIds(meetingIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (meetingIds.length === 0) return map;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_meeting_vendors")
    .select("meeting_id, vendor_id")
    .in("meeting_id", meetingIds);

  if (error) {
    throw error;
  }

  for (const row of data ?? []) {
    const meetingId = row.meeting_id as string;
    const vendorId = row.vendor_id as string;
    const existing = map.get(meetingId) ?? [];
    existing.push(vendorId);
    map.set(meetingId, existing);
  }
  return map;
}

export async function replaceMeetingVendors(
  meetingId: string,
  vendorIds: string[],
): Promise<string[]> {
  const admin = createAdminClient();
  const unique = [...new Set(vendorIds)];

  const { error: deleteError } = await admin
    .from("crm_meeting_vendors")
    .delete()
    .eq("meeting_id", meetingId);

  if (deleteError) {
    throw deleteError;
  }

  if (unique.length === 0) {
    return [];
  }

  const { error: insertError } = await admin.from("crm_meeting_vendors").insert(
    unique.map((vendorId) => ({
      meeting_id: meetingId,
      vendor_id: vendorId,
    })),
  );

  if (insertError) {
    throw insertError;
  }

  return unique;
}

export async function insertMeeting(
  row: InsertMeetingRow,
  vendorIds: string[] = [],
): Promise<Meeting> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_meetings")
    .insert({
      ...row,
      participants: (row.participants ?? []) as unknown as Json,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("insertMeeting returned no row");
  }

  const linked = await replaceMeetingVendors(data.id as string, vendorIds);
  return mapMeetingRow(data as Record<string, unknown>, linked);
}

export async function findMeetingById(
  meetingId: string,
  workspaceId?: string,
): Promise<Meeting | null> {
  const admin = createAdminClient();
  let query = admin.from("crm_meetings").select("*").eq("id", meetingId);
  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const vendorMap = await loadVendorIds([meetingId]);
  return mapMeetingRow(
    data as Record<string, unknown>,
    vendorMap.get(meetingId) ?? [],
  );
}

export async function findMeetingsByCompany(
  workspaceId: string,
  companyId: string,
): Promise<Meeting[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_meetings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const vendorMap = await loadVendorIds(rows.map((row) => row.id as string));
  return rows.map((row) =>
    mapMeetingRow(
      row as Record<string, unknown>,
      vendorMap.get(row.id as string) ?? [],
    ),
  );
}

export async function findMeetingsByProject(
  workspaceId: string,
  companyId: string,
  projectId: string,
): Promise<Meeting[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_meetings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("project_id", projectId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const vendorMap = await loadVendorIds(rows.map((row) => row.id as string));
  return rows.map((row) =>
    mapMeetingRow(
      row as Record<string, unknown>,
      vendorMap.get(row.id as string) ?? [],
    ),
  );
}

export async function findMeetingsByClient(
  workspaceId: string,
  companyId: string,
  clientId: string,
): Promise<Meeting[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("crm_meetings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .eq("client_id", clientId)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const vendorMap = await loadVendorIds(rows.map((row) => row.id as string));
  return rows.map((row) =>
    mapMeetingRow(
      row as Record<string, unknown>,
      vendorMap.get(row.id as string) ?? [],
    ),
  );
}

export async function findMeetingsByVendor(
  workspaceId: string,
  companyId: string,
  vendorId: string,
): Promise<Meeting[]> {
  const admin = createAdminClient();
  const { data: links, error: linkError } = await admin
    .from("crm_meeting_vendors")
    .select("meeting_id")
    .eq("vendor_id", vendorId);

  if (linkError) {
    throw linkError;
  }

  const meetingIds = (links ?? []).map((row) => row.meeting_id as string);
  if (meetingIds.length === 0) {
    return [];
  }

  const { data, error } = await admin
    .from("crm_meetings")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .in("id", meetingIds)
    .order("starts_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const vendorMap = await loadVendorIds(rows.map((row) => row.id as string));
  return rows.map((row) =>
    mapMeetingRow(
      row as Record<string, unknown>,
      vendorMap.get(row.id as string) ?? [],
    ),
  );
}

export async function updateMeetingById(
  meetingId: string,
  patch: UpdateMeetingRow,
  vendorIds?: string[],
): Promise<Meeting> {
  const admin = createAdminClient();
  const payload: {
    project_id?: string | null;
    client_id?: string | null;
    owner_id?: string | null;
    title?: string;
    meeting_type?: MeetingType;
    status?: MeetingStatus;
    meeting_date?: string;
    meeting_time?: string;
    duration_minutes?: number;
    starts_at?: string;
    location?: string | null;
    google_meet_link?: string | null;
    notes?: string | null;
    internal_notes?: string | null;
    participants?: Json;
  } = {};

  if (patch.project_id !== undefined) payload.project_id = patch.project_id;
  if (patch.client_id !== undefined) payload.client_id = patch.client_id;
  if (patch.owner_id !== undefined) payload.owner_id = patch.owner_id;
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.meeting_type !== undefined) payload.meeting_type = patch.meeting_type;
  if (patch.status !== undefined) payload.status = patch.status;
  if (patch.meeting_date !== undefined) payload.meeting_date = patch.meeting_date;
  if (patch.meeting_time !== undefined) payload.meeting_time = patch.meeting_time;
  if (patch.duration_minutes !== undefined) {
    payload.duration_minutes = patch.duration_minutes;
  }
  if (patch.starts_at !== undefined) payload.starts_at = patch.starts_at;
  if (patch.location !== undefined) payload.location = patch.location;
  if (patch.google_meet_link !== undefined) {
    payload.google_meet_link = patch.google_meet_link;
  }
  if (patch.notes !== undefined) payload.notes = patch.notes;
  if (patch.internal_notes !== undefined) {
    payload.internal_notes = patch.internal_notes;
  }
  if (patch.participants !== undefined) {
    payload.participants = patch.participants as unknown as Json;
  }

  const { data, error } = await admin
    .from("crm_meetings")
    .update(payload)
    .eq("id", meetingId)
    .select("*")
    .single();

  if (error || !data) {
    throw error ?? new Error("updateMeetingById returned no row");
  }

  let linked: string[];
  if (vendorIds !== undefined) {
    linked = await replaceMeetingVendors(meetingId, vendorIds);
  } else {
    const vendorMap = await loadVendorIds([meetingId]);
    linked = vendorMap.get(meetingId) ?? [];
  }

  return mapMeetingRow(data as Record<string, unknown>, linked);
}
