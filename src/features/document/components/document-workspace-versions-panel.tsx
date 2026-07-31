import type { DocumentVersionItem } from "@/features/document/lib/document-types";
import { formatDocumentDateTime } from "@/features/document/lib/document-labels";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceVersionsPanelProps = {
  versions: DocumentVersionItem[];
};

export function DocumentWorkspaceVersionsPanel({
  versions,
}: DocumentWorkspaceVersionsPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div>
        <h2 className="text-sm font-medium text-white">{uiZh.versions}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.versionHistoryDesc}
        </p>
      </div>

      {versions.length === 0 ? (
        <p className="mt-6 text-sm text-white/45">{uiZh.noVersionHistoryYet}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {versions.map((version) => (
            <li
              key={version.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-white">
                  {version.documentName}{" "}
                  <span className="text-white/45">v{version.version}</span>
                </p>
                <time className="text-[11px] text-white/35">
                  {formatDocumentDateTime(version.updatedAt)}
                </time>
              </div>
              <p className="mt-1 text-xs text-white/45">
                {version.updatedByLabel ?? uiZh.unknown}
                {version.note ? ` · ${version.note}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
