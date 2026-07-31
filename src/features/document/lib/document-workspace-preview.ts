import type { Document } from "@/core/document";
import type { DocumentWorkspaceModel } from "@/features/document/lib/document-types";
import { DOCUMENT_WORKSPACE_HUB_ID } from "@/features/document/lib/document-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

const PREVIEW_COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const PREVIEW_PROJECT_ID = "00000000-0000-4000-8000-000000000010";
const ACTOR_ALEX = "00000000-0000-4000-8000-0000000000a1";
const ACTOR_JORDAN = "00000000-0000-4000-8000-0000000000a2";

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * UI foundation sample Document Workspace.
 * Persistence / storage / upload are intentionally out of scope.
 */
export function getDocumentWorkspacePreview(
  hubId: string = DOCUMENT_WORKSPACE_HUB_ID,
): DocumentWorkspaceModel {
  const documents: Document[] = [
    {
      id: "00000000-0000-4000-8000-0000000000d1",
      companyId: PREVIEW_COMPANY_ID,
      workspaceKind: "project",
      workspaceId: PREVIEW_PROJECT_ID,
      name: "仪式流程单",
      originalFilename: "ceremony-run-sheet.pdf",
      mimeType: "application/pdf",
      extension: "pdf",
      size: 248_320,
      storageKey: "preview/ceremony-run-sheet.pdf",
      folder: "策划",
      description: "婚礼当日仪式顺序",
      version: 3,
      status: "ready",
      createdBy: ACTOR_ALEX,
      updatedBy: ACTOR_JORDAN,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
    },
    {
      id: "00000000-0000-4000-8000-0000000000d2",
      companyId: PREVIEW_COMPANY_ID,
      workspaceKind: "project",
      workspaceId: PREVIEW_PROJECT_ID,
      name: "场地平面图 — 宴会厅",
      originalFilename: "ballroom-floor-plan.png",
      mimeType: "image/png",
      extension: "png",
      size: 1_842_112,
      storageKey: "preview/ballroom-floor-plan.png",
      folder: "场地",
      description: null,
      version: 2,
      status: "ready",
      createdBy: ACTOR_ALEX,
      updatedBy: ACTOR_ALEX,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(4),
    },
    {
      id: "00000000-0000-4000-8000-0000000000d3",
      companyId: PREVIEW_COMPANY_ID,
      workspaceKind: "project",
      workspaceId: PREVIEW_PROJECT_ID,
      name: "供应商预算",
      originalFilename: "vendor-budget.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      extension: "xlsx",
      size: 96_512,
      storageKey: "preview/vendor-budget.xlsx",
      folder: "财务",
      description: "工作预算表",
      version: 5,
      status: "draft",
      createdBy: ACTOR_JORDAN,
      updatedBy: ACTOR_JORDAN,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(2),
    },
    {
      id: "00000000-0000-4000-8000-0000000000d4",
      companyId: PREVIEW_COMPANY_ID,
      workspaceKind: "project",
      workspaceId: PREVIEW_PROJECT_ID,
      name: "客户合同",
      originalFilename: "client-contract.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      extension: "docx",
      size: 412_800,
      storageKey: "preview/client-contract.docx",
      folder: "法务",
      description: "已签署服务协议草稿",
      version: 1,
      status: "archived",
      createdBy: ACTOR_ALEX,
      updatedBy: ACTOR_ALEX,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(40),
    },
    {
      id: "00000000-0000-4000-8000-0000000000d5",
      companyId: PREVIEW_COMPANY_ID,
      workspaceKind: "project",
      workspaceId: PREVIEW_PROJECT_ID,
      name: "情绪板拼贴",
      originalFilename: "moodboard.jpg",
      mimeType: "image/jpeg",
      extension: "jpg",
      size: 3_210_880,
      storageKey: "preview/moodboard.jpg",
      folder: "创意",
      description: null,
      version: 1,
      status: "ready",
      createdBy: ACTOR_JORDAN,
      updatedBy: ACTOR_JORDAN,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
  ];

  const labels: Record<string, string> = {
    [ACTOR_ALEX]: "Alex Chen",
    [ACTOR_JORDAN]: "Jordan Lee",
  };

  const items = documents.map((doc) => ({
    ...doc,
    updatedByLabel: doc.updatedBy ? (labels[doc.updatedBy] ?? null) : null,
    createdByLabel: labels[doc.createdBy] ?? null,
  }));

  const folderNames = [
    ...new Set(
      items
        .map((doc) => doc.folder)
        .filter((folder): folder is string => Boolean(folder)),
    ),
  ].sort();

  const folders = folderNames.map((name, index) => ({
    id: `folder-${index + 1}`,
    name,
    documentCount: items.filter((doc) => doc.folder === name).length,
  }));

  const totalStorageBytes = items.reduce((sum, doc) => sum + doc.size, 0);

  return {
    id: hubId.trim() || DOCUMENT_WORKSPACE_HUB_ID,
    title: uiZh.documentWorkspaceTitle,
    description: "本公司的文件与文件夹（预览）",
    companyId: PREVIEW_COMPANY_ID,
    totalStorageBytes,
    linkedWorkspace: {
      kind: "project",
      id: PREVIEW_PROJECT_ID,
      name: uiZh.previewChenWedding,
    },
    documents: items,
    folders,
    versions: [
      {
        id: "v1",
        documentId: items[0]!.id,
        documentName: items[0]!.name,
        version: 3,
        updatedByLabel: "Jordan Lee",
        updatedAt: daysAgo(1),
        note: "更新了入场行进时间",
      },
      {
        id: "v2",
        documentId: items[0]!.id,
        documentName: items[0]!.name,
        version: 2,
        updatedByLabel: "Alex Chen",
        updatedAt: daysAgo(5),
        note: "增加彩排时段",
      },
      {
        id: "v3",
        documentId: items[2]!.id,
        documentName: items[2]!.name,
        version: 5,
        updatedByLabel: "Jordan Lee",
        updatedAt: daysAgo(2),
        note: "花艺报价已修订",
      },
      {
        id: "v4",
        documentId: items[1]!.id,
        documentName: items[1]!.name,
        version: 2,
        updatedByLabel: "Alex Chen",
        updatedAt: daysAgo(4),
        note: "调整了舞池尺寸",
      },
    ],
    activities: [
      {
        id: "act1",
        actorLabel: "Jordan Lee",
        message: "上传了仪式流程单（v3）",
        createdAt: daysAgo(1),
      },
      {
        id: "act2",
        actorLabel: "Jordan Lee",
        message: "更新了供应商预算",
        createdAt: daysAgo(2),
      },
      {
        id: "act3",
        actorLabel: "Alex Chen",
        message: "上传了场地平面图 — 宴会厅（v2）",
        createdAt: daysAgo(4),
      },
      {
        id: "act4",
        actorLabel: "Jordan Lee",
        message: "上传了情绪板拼贴",
        createdAt: daysAgo(8),
      },
      {
        id: "act5",
        actorLabel: "Alex Chen",
        message: "归档了客户合同",
        createdAt: daysAgo(40),
      },
    ],
  };
}
