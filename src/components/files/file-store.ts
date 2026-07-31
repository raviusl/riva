"use client";

import type { ProjectFile } from "@/components/files/file-types";

const STORAGE_PREFIX = "riva.os.files.v1";

type StoreSnapshot = {
  files: ProjectFile[];
};

function storageKey(workspaceId: string, companyId: string): string {
  return `${STORAGE_PREFIX}:${workspaceId}:${companyId}`;
}

function readSnapshot(
  workspaceId: string,
  companyId: string,
): StoreSnapshot {
  if (typeof window === "undefined") {
    return { files: [] };
  }
  try {
    const raw = window.localStorage.getItem(
      storageKey(workspaceId, companyId),
    );
    if (!raw) return { files: [] };
    const parsed = JSON.parse(raw) as StoreSnapshot;
    if (!Array.isArray(parsed.files)) return { files: [] };
    return { files: parsed.files };
  } catch {
    return { files: [] };
  }
}

function writeSnapshot(
  workspaceId: string,
  companyId: string,
  snapshot: StoreSnapshot,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(workspaceId, companyId),
    JSON.stringify(snapshot),
  );
  window.dispatchEvent(
    new CustomEvent("riva-files-changed", {
      detail: { workspaceId, companyId },
    }),
  );
}

export function listProjectFiles(
  workspaceId: string,
  companyId: string,
): ProjectFile[] {
  return readSnapshot(workspaceId, companyId).files.sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt),
  );
}

export function getProjectFile(
  workspaceId: string,
  companyId: string,
  fileId: string,
): ProjectFile | null {
  return (
    readSnapshot(workspaceId, companyId).files.find(
      (file) => file.id === fileId,
    ) ?? null
  );
}

export function upsertProjectFiles(
  workspaceId: string,
  companyId: string,
  files: ProjectFile[],
): ProjectFile[] {
  const existing = readSnapshot(workspaceId, companyId).files;
  const byId = new Map(existing.map((file) => [file.id, file]));
  for (const file of files) {
    byId.set(file.id, file);
  }
  const next = [...byId.values()];
  writeSnapshot(workspaceId, companyId, { files: next });
  return next.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function subscribeProjectFiles(
  workspaceId: string,
  companyId: string,
  listener: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey(workspaceId, companyId)) {
      listener();
    }
  };
  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent).detail as
      | { workspaceId?: string; companyId?: string }
      | undefined;
    if (
      detail?.workspaceId === workspaceId &&
      detail?.companyId === companyId
    ) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("riva-files-changed", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("riva-files-changed", onCustom);
  };
}
