"use server";

import { requireSessionContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { CoreError, toCoreUserMessage } from "@/core/errors";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import { listWorkspaceMembers } from "@/core/membership/membership";
import { listProjectsByCompany } from "@/core/project/project";
import { listTasks } from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { toClientSearchDocuments } from "@/features/client/lib/client-search-document";
import { toMeetingSearchDocuments } from "@/features/meeting/lib/meeting-search-document";
import { toTaskSearchDocuments } from "@/features/task/lib/task-search-document";
import { toVendorSearchDocuments } from "@/features/vendor/lib/vendor-search-document";
import type { SearchDocumentWithHref } from "@/features/search/universal-search-documents";
import {
  toCommandSearchDocuments,
  toFutureModuleSearchDocuments,
  toMemberSearchDocuments,
  toProjectSearchDocuments,
  toSettingsSearchDocuments,
  toWorkspaceNavSearchDocuments,
} from "@/features/search/universal-search-documents";

export type UniversalSearchIndexResult =
  | { ok: true; data: { documents: SearchDocumentWithHref[] } }
  | { ok: false; error: string };

type LoadIndexInput = {
  workspaceId: string;
  companyId: string;
};

/**
 * Load Command Palette / Universal Search candidates for the active company.
 * Permissions + company isolation applied here. Files merge on the client.
 */
export async function loadUniversalSearchIndexAction(
  input: LoadIndexInput,
): Promise<UniversalSearchIndexResult> {
  try {
    const context = await requireSessionContext();
    if (
      context.workspace.id !== input.workspaceId ||
      context.company.id !== input.companyId
    ) {
      throw new CoreError(
        "SEARCH_SCOPE_MISMATCH",
        "Search is limited to the active workspace.",
      );
    }

    const [clients, vendors, projects, tasks, meetings, members] =
      await Promise.all([
        context.permissions.has("client.read")
          ? listClientsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        context.permissions.has("vendor.read")
          ? listVendorsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        context.permissions.has("project.read")
          ? listProjectsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        context.permissions.has("task.read")
          ? listTasks({
              workspaceId: input.workspaceId,
              companyId: input.companyId,
              includeArchived: false,
            })
          : Promise.resolve([]),
        context.permissions.has("meeting.read")
          ? listMeetingsByCompany(input.workspaceId, input.companyId)
          : Promise.resolve([]),
        listWorkspaceMembers(input.workspaceId).catch(() => []),
      ]);

    const companyMembers = members.filter(
      (member) =>
        member.company_id === null || member.company_id === input.companyId,
    );

    const documents: SearchDocumentWithHref[] = [
      ...toCommandSearchDocuments(
        input.workspaceId,
        input.companyId,
        context.permissions,
      ),
      ...toWorkspaceNavSearchDocuments(input.workspaceId, input.companyId),
      ...toClientSearchDocuments(clients),
      ...toVendorSearchDocuments(vendors),
      ...toProjectSearchDocuments(projects),
      ...toTaskSearchDocuments(tasks),
      ...toMeetingSearchDocuments(meetings),
      ...toMemberSearchDocuments(companyMembers, input.companyId),
      ...toSettingsSearchDocuments(input.workspaceId, input.companyId),
      ...toFutureModuleSearchDocuments(input.workspaceId, input.companyId),
    ];

    return { ok: true, data: { documents } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load search index"),
    };
  }
}
