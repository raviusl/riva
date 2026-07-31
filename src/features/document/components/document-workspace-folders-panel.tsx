"use client";

import { useMemo, useState } from "react";

import type {
  DocumentFolderItem,
  DocumentWorkspaceItem,
} from "@/features/document/lib/document-types";
import {
  formatDocumentBytes,
  formatDocumentDateTime,
} from "@/features/document/lib/document-labels";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceFoldersPanelProps = {
  folders: DocumentFolderItem[];
  documents: DocumentWorkspaceItem[];
};

export function DocumentWorkspaceFoldersPanel({
  folders,
  documents,
}: DocumentWorkspaceFoldersPanelProps) {
  const [activeFolder, setActiveFolder] = useState<string | null>(
    folders[0]?.name ?? null,
  );

  const folderDocs = useMemo(() => {
    if (!activeFolder) return [];
    return documents
      .filter((doc) => doc.folder === activeFolder)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeFolder, documents]);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.folders}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.folderBrowserDesc}
        </p>
      </div>

      {folders.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noFoldersYet}</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <ul className="space-y-1">
            {folders.map((folder) => {
              const isActive = folder.name === activeFolder;
              return (
                <li key={folder.id}>
                  <button
                    type="button"
                    onClick={() => setActiveFolder(folder.name)}
                    className={
                      isActive
                        ? "flex w-full items-center justify-between rounded-lg bg-white/[0.08] px-3 py-2 text-left text-sm text-white"
                        : "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/60 hover:bg-white/[0.04] hover:text-white/80"
                    }
                  >
                    <span>{folder.name}</span>
                    <span className="text-[11px] text-white/35">
                      {folder.documentCount}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
            <h3 className="text-sm text-white">{activeFolder ?? uiZh.folder}</h3>
            {folderDocs.length === 0 ? (
              <p className="mt-3 text-sm text-white/45">{uiZh.folderEmpty}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {folderDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/[0.05] py-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-white">{doc.name}</p>
                      <p className="mt-0.5 text-[11px] text-white/35">
                        {doc.extension.toUpperCase()} ·{" "}
                        {formatDocumentBytes(doc.size)} · v{doc.version}
                      </p>
                    </div>
                    <time className="text-[11px] text-white/35">
                      {formatDocumentDateTime(doc.updatedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
