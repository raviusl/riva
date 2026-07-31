"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import type { DocumentWorkspaceModel } from "@/features/document/lib/document-types";
import {
  formatDocumentBytes,
  formatDocumentDateTime,
} from "@/features/document/lib/document-labels";
import { buildDocumentWorkspaceTabHref } from "@/features/document/lib/document-workspace-tabs";
import { uiZh } from "@/config/ui-zh";

type DocumentWorkspaceOverviewProps = {
  workspace: DocumentWorkspaceModel;
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr] sm:items-baseline">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-sm text-white/80 break-words">{value}</dd>
    </div>
  );
}

export function DocumentWorkspaceOverview({
  workspace,
}: DocumentWorkspaceOverviewProps) {
  const recentUploads = [...workspace.documents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const recentActivity = workspace.activities.slice(0, 4);
  const documentsHref = buildDocumentWorkspaceTabHref(
    workspace.id,
    "documents",
  );
  const activityHref = buildDocumentWorkspaceTabHref(workspace.id, "activity");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">{uiZh.librarySummary}</h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.libraryTotalsDesc}
            </p>
          </div>
          <Link
            href={documentsHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.browseDocuments}
          </Link>
        </div>

        <dl className="mt-5 space-y-4">
          <InfoRow
            label={uiZh.totalDocuments}
            value={String(workspace.documents.length)}
          />
          <InfoRow
            label={uiZh.totalStorage}
            value={formatDocumentBytes(workspace.totalStorageBytes)}
          />
          <InfoRow
            label={uiZh.folders}
            value={String(workspace.folders.length)}
          />
          <InfoRow
            label={uiZh.linkedWorkspace}
            value={
              workspace.linkedWorkspace ? (
                <WorkspaceEntityLink
                  kind={workspace.linkedWorkspace.kind}
                  id={workspace.linkedWorkspace.id}
                >
                  {workspace.linkedWorkspace.name}
                </WorkspaceEntityLink>
              ) : (
                uiZh.emDash
              )
            }
          />
        </dl>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <h2 className="text-sm font-medium text-white">{uiZh.recentUploads}</h2>
        <p className="mt-1 text-xs text-white/45">
          {uiZh.newestDocumentsDesc}
        </p>

        {recentUploads.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noUploadsYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentUploads.map((doc) => (
              <li
                key={doc.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">{doc.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {doc.extension.toUpperCase()} ·{" "}
                    {formatDocumentBytes(doc.size)}
                    {doc.folder ? ` · ${doc.folder}` : ""}
                  </p>
                </div>
                <time className="text-[11px] text-white/35">
                  {formatDocumentDateTime(doc.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">
              {uiZh.recentActivityTitle2}
            </h2>
            <p className="mt-1 text-xs text-white/45">
              {uiZh.latestDocumentHistory}
            </p>
          </div>
          <Link
            href={activityHref}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            {uiZh.viewActivity}
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="mt-4 text-sm text-white/45">{uiZh.noActivityYet}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-white/80">{item.message}</p>
                  <time className="text-[11px] text-white/35">
                    {formatDocumentDateTime(item.createdAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {item.actorLabel ?? uiZh.unknown}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
