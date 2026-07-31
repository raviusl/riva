import { uiZh } from "@/config/ui-zh";

export function formatDocumentBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDocumentDateTime(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function documentTypeLabel(
  mimeType: string,
  extension: string,
): string {
  const ext = extension.replace(/^\./, "").toUpperCase();
  if (mimeType.startsWith("image/")) return `图片 · ${ext}`;
  if (mimeType.startsWith("video/")) return `视频 · ${ext}`;
  if (mimeType.startsWith("audio/")) return `音频 · ${ext}`;
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.includes("spreadsheet") || ext === "XLSX" || ext === "CSV") {
    return `表格 · ${ext}`;
  }
  if (mimeType.includes("word") || ext === "DOCX" || ext === "DOC") {
    return `文档 · ${ext}`;
  }
  return ext || mimeType;
}

export function documentTypeFilterKey(
  mimeType: string,
  extension: string,
): string {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("spreadsheet") || ["xlsx", "csv"].includes(extension)) {
    return "spreadsheet";
  }
  if (mimeType.includes("word") || ["docx", "doc"].includes(extension)) {
    return "document";
  }
  return extension || "other";
}

export function documentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: uiZh.draft,
    active: uiZh.active,
    ready: uiZh.docStatusReady,
    archived: uiZh.archived,
    published: uiZh.docStatusPublished,
  };
  return map[status] ?? status;
}
