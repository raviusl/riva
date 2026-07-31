import type { Document, DocumentWorkspaceKind } from "@/core/document";

/** Document row with display labels for the Documents tab. */
export type DocumentWorkspaceItem = Document & {
  updatedByLabel: string | null;
  createdByLabel: string | null;
};

export type DocumentFolderItem = {
  id: string;
  name: string;
  documentCount: number;
};

export type DocumentVersionItem = {
  id: string;
  documentId: string;
  documentName: string;
  version: number;
  updatedByLabel: string | null;
  updatedAt: string;
  note: string | null;
};

export type DocumentActivityItem = {
  id: string;
  actorLabel: string | null;
  message: string;
  createdAt: string;
};

export type DocumentLinkedWorkspace = {
  kind: DocumentWorkspaceKind;
  id: string;
  name: string;
};

/** Hub model for the Document Workspace (preview until persistence). */
export type DocumentWorkspaceModel = {
  id: string;
  title: string;
  description: string;
  companyId: string;
  totalStorageBytes: number;
  linkedWorkspace: DocumentLinkedWorkspace | null;
  documents: DocumentWorkspaceItem[];
  folders: DocumentFolderItem[];
  versions: DocumentVersionItem[];
  activities: DocumentActivityItem[];
};
