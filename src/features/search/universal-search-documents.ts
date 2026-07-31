/**
 * Command Palette / Universal Search document adapters
 * (Projects 072 + 075). Reuses Global Search document shape.
 */

import type { ProjectFile } from "@/components/files/file-types";
import { formatFileType } from "@/components/files/file-labels";
import { uiZh } from "@/config/ui-zh";
import type { Project, WorkspaceMember } from "@/core/types";
import type { GlobalSearchDocument } from "@/features/search/search-result";
import { SETTINGS_SECTIONS } from "@/features/settings/lib/settings-sections";

export type SearchDocumentWithHref = GlobalSearchDocument & { href: string };

const nowIso = () => new Date().toISOString();

export function toProjectSearchDocument(
  project: Project,
): SearchDocumentWithHref {
  const keywords = [
    project.name,
    project.description,
    project.status,
    project.project_type,
  ].filter((value): value is string => Boolean(value && value.trim()));

  return {
    id: `project:${project.id}`,
    entityType: "project",
    entityId: project.id,
    companyId: project.company_id,
    workspaceId: project.workspace_id,
    title: project.name,
    subtitle: [project.status, project.project_type].filter(Boolean).join(" · "),
    keywords,
    tags: [project.status, ...(project.project_type ? [project.project_type] : [])],
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    href: `/dashboard/projects/${project.id}`,
  };
}

export function toProjectSearchDocuments(
  projects: readonly Project[],
): SearchDocumentWithHref[] {
  return projects
    .filter((project) => project.status !== "archived")
    .map(toProjectSearchDocument);
}

export function toFileSearchDocument(
  file: ProjectFile,
): SearchDocumentWithHref {
  return {
    id: `file:${file.id}`,
    entityType: "document",
    entityId: file.id,
    companyId: file.companyId,
    workspaceId: file.workspaceId,
    title: file.name,
    subtitle: `${formatFileType(file.type)} · ${file.projectName}`,
    keywords: [file.name, file.projectName, formatFileType(file.type), file.extension],
    tags: [file.type, "file"],
    createdAt: file.uploadedAt,
    updatedAt: file.uploadedAt,
    href: `/dashboard/files/${file.id}`,
  };
}

export function toFileSearchDocuments(
  files: readonly ProjectFile[],
): SearchDocumentWithHref[] {
  return files.map(toFileSearchDocument);
}

export function toMemberSearchDocument(
  member: WorkspaceMember,
  companyId: string,
): SearchDocumentWithHref {
  return {
    id: `member:${member.id}`,
    entityType: "member",
    entityId: member.id,
    companyId,
    workspaceId: member.workspace_id,
    title: member.full_name,
    subtitle: [member.email, member.roles.join(", ")].filter(Boolean).join(" · "),
    keywords: [member.full_name, member.email, ...member.roles],
    tags: ["member", ...member.roles],
    createdAt: member.created_at,
    updatedAt: member.updated_at,
    href: "/dashboard/settings/members",
  };
}

export function toMemberSearchDocuments(
  members: readonly WorkspaceMember[],
  companyId: string,
): SearchDocumentWithHref[] {
  return members
    .filter((member) => member.status === "accepted")
    .map((member) => toMemberSearchDocument(member, companyId));
}

export function toSettingsSearchDocuments(
  workspaceId: string,
  companyId: string,
): SearchDocumentWithHref[] {
  const stamp = nowIso();
  return SETTINGS_SECTIONS.map((section) => ({
    id: `settings:${section.id}`,
    entityType: "settings" as const,
    entityId: section.id,
    companyId,
    workspaceId,
    title: section.label,
    subtitle: section.description,
    keywords: [section.label, section.description, section.group, "settings", "设置"],
    tags: ["settings", section.group],
    createdAt: stamp,
    updatedAt: stamp,
    href: section.href,
  }));
}

/** Primary navigation destinations (Project 075). */
export const NAVIGATION_DESTINATIONS = [
  {
    id: "home",
    title: uiZh.navGoHome,
    href: "/dashboard",
    keywords: ["首页", "主页", "home", "dashboard"],
  },
  {
    id: "clients",
    title: uiZh.navGoClients,
    href: "/dashboard/clients",
    keywords: ["客户", "crm", "clients"],
  },
  {
    id: "projects",
    title: uiZh.navGoProjects,
    href: "/dashboard/projects",
    keywords: ["项目", "projects"],
  },
  {
    id: "vendors",
    title: uiZh.navGoVendors,
    href: "/dashboard/vendors",
    keywords: ["供应商", "vendors"],
  },
  {
    id: "meetings",
    title: uiZh.navGoMeetings,
    href: "/dashboard/meetings",
    keywords: ["会议", "meetings"],
  },
  {
    id: "tasks",
    title: uiZh.navGoTasks,
    href: "/dashboard/tasks",
    keywords: ["任务", "tasks", "待办"],
  },
  {
    id: "settings",
    title: uiZh.navGoSettings,
    href: "/dashboard/settings",
    keywords: ["设置", "settings"],
  },
] as const;

export function toWorkspaceNavSearchDocuments(
  workspaceId: string,
  companyId: string,
): SearchDocumentWithHref[] {
  const stamp = nowIso();
  return NAVIGATION_DESTINATIONS.map((item) => ({
    id: `workspace-nav:${item.id}`,
    entityType: "workspace" as const,
    entityId: item.id,
    companyId,
    workspaceId,
    title: item.title,
    subtitle: uiZh.navigation,
    keywords: [...item.keywords, uiZh.navigation],
    tags: ["workspace", "navigation"],
    createdAt: stamp,
    updatedAt: stamp,
    href: item.href,
  }));
}

/** Future-ready module placeholders (searchable, not inventing new engines). */
export const FUTURE_MODULE_PLACEHOLDERS = [
  {
    id: "documents",
    title: uiZh.navGoDocuments,
    href: "/dashboard/documents",
    entityType: "document" as const,
    keywords: ["文档", "documents", "files", "文件"],
  },
  {
    id: "finance",
    title: uiZh.navGoFinance,
    href: "/dashboard/finance",
    entityType: "finance" as const,
    keywords: ["财务", "finance", "账单"],
  },
  {
    id: "calendar",
    title: uiZh.navGoCalendar,
    href: "/dashboard/calendar",
    entityType: "meeting" as const,
    keywords: ["日历", "calendar", "日程"],
  },
] as const;

export function toFutureModuleSearchDocuments(
  workspaceId: string,
  companyId: string,
): SearchDocumentWithHref[] {
  const stamp = nowIso();
  return FUTURE_MODULE_PLACEHOLDERS.map((item) => ({
    id: `future:${item.id}`,
    entityType: item.entityType,
    entityId: item.id,
    companyId,
    workspaceId,
    title: item.title,
    subtitle: uiZh.placeholderModuleDesc,
    keywords: [...item.keywords, uiZh.comingSoon, uiZh.futureModules],
    tags: ["future", "placeholder", item.id],
    createdAt: stamp,
    updatedAt: stamp,
    href: item.href,
  }));
}

export type QuickCommandDefinition = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  /** Permission required to show this action (omit = always). */
  permission?: string;
};

export const QUICK_COMMANDS: readonly QuickCommandDefinition[] = [
  {
    id: "create-client",
    title: uiZh.cmdCreateClient,
    subtitle: uiZh.cmdCreateClientDesc,
    href: "/dashboard/clients/new",
    keywords: ["新建客户", "添加客户", "crm", "客户", "create client"],
    permission: "client.write",
  },
  {
    id: "create-project",
    title: uiZh.cmdCreateProject,
    subtitle: uiZh.cmdCreateProjectDesc,
    href: "/dashboard/projects/new",
    keywords: ["新建项目", "添加项目", "项目", "create project"],
    permission: "project.write",
  },
  {
    id: "create-vendor",
    title: uiZh.cmdCreateVendor,
    subtitle: uiZh.cmdCreateVendorDesc,
    href: "/dashboard/vendors/new",
    keywords: ["新建供应商", "添加供应商", "供应商", "create vendor"],
    permission: "vendor.write",
  },
  {
    id: "create-meeting",
    title: uiZh.cmdCreateMeeting,
    subtitle: uiZh.cmdCreateMeetingDesc,
    href: "/dashboard/meetings/new",
    keywords: ["新建会议", "添加会议", "会议", "create meeting"],
    permission: "meeting.write",
  },
  {
    id: "create-task",
    title: uiZh.cmdCreateTask,
    subtitle: uiZh.cmdCreateTaskDesc,
    href: "/dashboard/tasks/new",
    keywords: ["新建任务", "添加任务", "待办", "任务", "create task"],
    permission: "task.write",
  },
] as const;

export function toCommandSearchDocuments(
  workspaceId: string,
  companyId: string,
  permissions?: ReadonlySet<string> | readonly string[],
): SearchDocumentWithHref[] {
  const stamp = nowIso();
  const allowed =
    permissions == null
      ? null
      : permissions instanceof Set
        ? permissions
        : new Set(permissions);

  return QUICK_COMMANDS.filter((command) => {
    if (!command.permission || !allowed) return true;
    return allowed.has(command.permission);
  }).map((command) => ({
    id: `command:${command.id}`,
    entityType: "command" as const,
    entityId: command.id,
    companyId,
    workspaceId,
    title: command.title,
    subtitle: command.subtitle,
    keywords: [command.title, command.subtitle, ...command.keywords],
    tags: ["command", "action", "quick-action"],
    createdAt: stamp,
    updatedAt: stamp,
    href: command.href,
  }));
}
