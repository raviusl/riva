"use client";

import { useMemo, useState } from "react";

import type { DocumentWorkspaceItem } from "@/features/document/lib/document-types";
import {
  documentTypeFilterKey,
  documentTypeLabel,
  formatDocumentBytes,
  formatDocumentDateTime,
} from "@/features/document/lib/document-labels";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceDocumentsPanelProps = {
  documents: DocumentWorkspaceItem[];
};

type SortKey = "name" | "size" | "version" | "updatedAt";

const TYPE_FILTERS = [
  { id: "all", label: uiZh.allTypes },
  { id: "pdf", label: uiZh.fileTypePdf },
  { id: "image", label: uiZh.image },
  { id: "spreadsheet", label: uiZh.spreadsheet },
  { id: "document", label: uiZh.document },
] as const;

export function DocumentWorkspaceDocumentsPanel({
  documents,
}: DocumentWorkspaceDocumentsPanelProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [typeFilter, setTypeFilter] =
    useState<(typeof TYPE_FILTERS)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = documents.filter((doc) => {
      const matchesSearch =
        !query ||
        doc.name.toLowerCase().includes(query) ||
        doc.originalFilename.toLowerCase().includes(query);
      const matchesType =
        typeFilter === "all" ||
        documentTypeFilterKey(doc.mimeType, doc.extension) === typeFilter;
      return matchesSearch && matchesType;
    });

    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "size":
          cmp = a.size - b.size;
          break;
        case "version":
          cmp = a.version - b.version;
          break;
        case "updatedAt":
          cmp = a.updatedAt.localeCompare(b.updatedAt);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [documents, search, sortDir, sortKey, typeFilter]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.documents}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.documentsPanelDesc}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={uiZh.searchDocuments}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none sm:max-w-xs"
        />
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(
              event.target.value as (typeof TYPE_FILTERS)[number]["id"],
            )
          }
          className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
        >
          {TYPE_FILTERS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noDocumentsMatch}</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/40">
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="hover:text-white/70"
                  >
                    {uiZh.name}{sortIndicator("name")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">{uiZh.type}</th>
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("size")}
                    className="hover:text-white/70"
                  >
                    {uiZh.size}{sortIndicator("size")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("version")}
                    className="hover:text-white/70"
                  >
                    {uiZh.versionCol}{sortIndicator("version")}
                  </button>
                </th>
                <th className="pb-2 pr-3 font-medium">{uiZh.updatedBy}</th>
                <th className="pb-2 font-medium">
                  <button
                    type="button"
                    onClick={() => toggleSort("updatedAt")}
                    className="hover:text-white/70"
                  >
                    {uiZh.updatedAtCol}{sortIndicator("updatedAt")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-white/[0.06] text-white/80"
                >
                  <td className="py-3 pr-3 text-white">
                    <div>{doc.name}</div>
                    {doc.folder ? (
                      <div className="mt-0.5 text-[11px] text-white/35">
                        {doc.folder}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {documentTypeLabel(doc.mimeType, doc.extension)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {formatDocumentBytes(doc.size)}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    v{doc.version}
                  </td>
                  <td className="py-3 pr-3 text-xs text-white/55">
                    {doc.updatedByLabel ?? "—"}
                  </td>
                  <td className="py-3 text-xs text-white/55">
                    {formatDocumentDateTime(doc.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
