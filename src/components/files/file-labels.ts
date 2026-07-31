import { uiZh } from "@/config/ui-zh";
import type { FileFoundationType } from "@/components/files/file-types";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatFileDate(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatFileDateTime(value: string | null | undefined): string {
  if (!value) return uiZh.emDash;
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatFileType(type: FileFoundationType): string {
  switch (type) {
    case "pdf":
      return uiZh.fileTypePdf;
    case "image":
      return uiZh.image;
    case "video":
      return uiZh.video;
    case "word":
      return uiZh.fileTypeWord;
    case "excel":
      return uiZh.fileTypeExcel;
    case "zip":
      return uiZh.fileTypeZip;
    default:
      return type;
  }
}

export function detectFileFoundationType(
  mimeType: string,
  extension: string,
): FileFoundationType | null {
  const ext = extension.replace(/^\./, "").toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return "image";
  }
  if (
    mime.startsWith("video/") ||
    ["mp4", "mov"].includes(ext)
  ) {
    return "video";
  }
  if (
    mime.includes("word") ||
    ["doc", "docx"].includes(ext)
  ) {
    return "word";
  }
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    ["xls", "xlsx"].includes(ext)
  ) {
    return "excel";
  }
  if (mime === "application/zip" || mime.includes("zip") || ext === "zip") {
    return "zip";
  }
  return null;
}

export function fileExtensionFromName(filename: string): string {
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1]?.toLowerCase() ?? "";
}
