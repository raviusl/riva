export const FILE_FOUNDATION_TYPES = [
  "pdf",
  "image",
  "video",
  "word",
  "excel",
  "zip",
] as const;

export type FileFoundationType = (typeof FILE_FOUNDATION_TYPES)[number];

/** Session-local project file (persistence deferred — Project 067). */
export type ProjectFile = {
  id: string;
  workspaceId: string;
  companyId: string;
  projectId: string;
  projectName: string;
  name: string;
  type: FileFoundationType;
  mimeType: string;
  extension: string;
  size: number;
  uploadedById: string;
  uploadedByName: string;
  uploadedAt: string;
  description: string | null;
};

export const FILE_FOUNDATION_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.zip,.mp4,.mov,application/pdf,image/*,video/mp4,video/quicktime,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip";
