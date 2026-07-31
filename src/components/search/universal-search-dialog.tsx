"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { SearchIcon } from "lucide-react";

import { listProjectFiles } from "@/components/files/file-store";
import { useUniversalSearch } from "@/components/search/universal-search-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiZh } from "@/config/ui-zh";
import { loadUniversalSearchIndexAction } from "@/core/actions/search-actions";
import { searchEverything } from "@/features/search/global-search";
import {
  isRememberableEntityType,
  listRecentItems,
  rememberRecentItem,
  type RecentItem,
} from "@/features/search/recent-items";
import type { GlobalSearchGroup } from "@/features/search/search-groups";
import type {
  GlobalSearchGroupId,
  GlobalSearchResult,
} from "@/features/search/search-result";
import {
  nextFocusIndex,
  previousFocusIndex,
} from "@/features/search/search-shortcuts";
import {
  toFileSearchDocuments,
  type SearchDocumentWithHref,
} from "@/features/search/universal-search-documents";
import { cn } from "@/lib/utils";

const SEARCH_GROUP_LABELS: Record<GlobalSearchGroupId, string> = {
  commands: uiZh.commands,
  clients: uiZh.clients,
  projects: uiZh.projects,
  tasks: uiZh.tasks,
  documents: uiZh.navGoDocuments,
  meetings: uiZh.meetings,
  vendors: uiZh.vendors,
  members: uiZh.teamMembers,
  settings: uiZh.settings,
  workspace: uiZh.navigation,
  timeline: uiZh.timeline,
  finance: uiZh.finance,
  notifications: uiZh.notifications,
  automation: uiZh.automation,
  company: uiZh.company,
};

function searchGroupLabel(groupId: GlobalSearchGroupId, fallback: string) {
  return SEARCH_GROUP_LABELS[groupId] ?? fallback;
}

type UniversalSearchDialogProps = {
  workspaceId: string;
  companyId: string;
};

type FlatItem =
  | { kind: "result"; id: string; result: GlobalSearchResult }
  | { kind: "recent-item"; id: string; item: RecentItem };

function documentToResult(doc: SearchDocumentWithHref): GlobalSearchResult {
  return {
    id: doc.id,
    groupId:
      doc.entityType === "command"
        ? "commands"
        : doc.entityType === "workspace"
          ? "workspace"
          : doc.entityType === "settings"
            ? "settings"
            : doc.entityType === "member"
              ? "members"
              : doc.entityType === "client"
                ? "clients"
                : doc.entityType === "project"
                  ? "projects"
                  : doc.entityType === "task"
                    ? "tasks"
                    : doc.entityType === "meeting"
                      ? "meetings"
                      : doc.entityType === "vendor"
                        ? "vendors"
                        : doc.entityType === "document"
                          ? "documents"
                          : doc.entityType === "finance"
                            ? "finance"
                            : "workspace",
    entityType: doc.entityType,
    entityId: doc.entityId,
    companyId: doc.companyId,
    workspaceId: doc.workspaceId,
    title: doc.title,
    subtitle: doc.subtitle,
    keywords: doc.keywords,
    tags: doc.tags,
    href: doc.href ?? null,
    score: 0,
    matchedBy: [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function flattenGroups(groups: GlobalSearchGroup[]): FlatItem[] {
  return groups.flatMap((group) =>
    group.results.map((result) => ({
      kind: "result" as const,
      id: result.id,
      result,
    })),
  );
}

function ResultButton({
  result,
  active,
  onActivate,
  onSelect,
}: {
  result: GlobalSearchResult;
  active: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition duration-150 ease-[var(--riva-ease)]",
        active
          ? "bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
          : "text-white/80 hover:bg-white/[0.045]",
      )}
      onMouseEnter={onActivate}
      onClick={onSelect}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium tracking-tight">
          {result.title}
        </span>
        {result.subtitle ? (
          <span className="mt-0.5 block truncate text-xs text-white/35">
            {result.subtitle}
          </span>
        ) : null}
      </span>
    </button>
  );
}

/**
 * Project 075 — Universal Command Palette.
 * Reuses Global Search (`searchEverything`) + company-scoped index action.
 */
export function UniversalSearchDialog({
  workspaceId,
  companyId,
}: UniversalSearchDialogProps) {
  const router = useRouter();
  const { open, setOpen } = useUniversalSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [documents, setDocuments] = useState<SearchDocumentWithHref[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIndex = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await loadUniversalSearchIndexAction({
        workspaceId,
        companyId,
      });
      if (!result.ok) {
        setError(result.error);
        setDocuments([]);
        setLoaded(true);
        return;
      }

      const files = toFileSearchDocuments(
        listProjectFiles(workspaceId, companyId),
      );
      setDocuments([...result.data.documents, ...files]);
      setLoaded(true);
    });
  }, [workspaceId, companyId]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    setRecentItems(listRecentItems(workspaceId, companyId));
    if (!loaded) {
      loadIndex();
    } else {
      setDocuments((prev) => {
        const withoutFiles = prev.filter((doc) => !doc.id.startsWith("file:"));
        return [
          ...withoutFiles,
          ...toFileSearchDocuments(listProjectFiles(workspaceId, companyId)),
        ];
      });
    }
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, loaded, loadIndex, workspaceId, companyId]);

  const idleGroups = useMemo((): GlobalSearchGroup[] => {
    const commands = documents
      .filter((doc) => doc.entityType === "command")
      .map(documentToResult);
    const navigation = documents
      .filter((doc) => doc.entityType === "workspace")
      .map(documentToResult);

    const groups: GlobalSearchGroup[] = [];
    if (commands.length > 0) {
      groups.push({
        id: "commands",
        label: uiZh.commands,
        results: commands,
      });
    }
    if (navigation.length > 0) {
      groups.push({
        id: "workspace",
        label: uiZh.navigation,
        results: navigation,
      });
    }
    return groups;
  }, [documents]);

  const groups = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return idleGroups;

    return searchEverything({
      query: trimmed,
      companyId,
      workspaceId,
      documents,
      rememberQuery: false,
    }).groups;
  }, [query, documents, companyId, workspaceId, idleGroups]);

  const flatItems = useMemo((): FlatItem[] => {
    const trimmed = query.trim();
    if (!trimmed) {
      const recentFlat: FlatItem[] = recentItems.map((item) => ({
        kind: "recent-item",
        id: `recent-item:${item.entityType}:${item.entityId}`,
        item,
      }));
      return [...recentFlat, ...flattenGroups(idleGroups)];
    }
    return flattenGroups(groups);
  }, [groups, query, recentItems, idleGroups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, flatItems.length]);

  function close() {
    setOpen(false);
  }

  function navigateToHref(
    href: string,
    meta?: {
      entityType: string;
      entityId: string;
      title: string;
      subtitle: string | null;
    },
  ) {
    if (
      meta &&
      isRememberableEntityType(meta.entityType)
    ) {
      rememberRecentItem(workspaceId, companyId, {
        entityType: meta.entityType,
        entityId: meta.entityId,
        title: meta.title,
        subtitle: meta.subtitle,
        href,
      });
      setRecentItems(listRecentItems(workspaceId, companyId));
    }
    close();
    router.push(href);
  }

  function selectItem(item: FlatItem) {
    if (item.kind === "recent-item") {
      navigateToHref(item.item.href, {
        entityType: item.item.entityType,
        entityId: item.item.entityId,
        title: item.item.title,
        subtitle: item.item.subtitle,
      });
      return;
    }

    const href = item.result.href;
    if (!href) return;

    navigateToHref(href, {
      entityType: item.result.entityType,
      entityId: item.result.entityId,
      title: item.result.title,
      subtitle: item.result.subtitle,
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => nextFocusIndex(current, flatItems.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        previousFocusIndex(current, flatItems.length),
      );
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      setActiveIndex((current) =>
        event.shiftKey
          ? previousFocusIndex(current, flatItems.length)
          : nextFocusIndex(current, flatItems.length),
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = flatItems[activeIndex];
      if (item) selectItem(item);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  const showIdle = !query.trim();
  const recentOffset = showIdle ? recentItems.length : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="riva-glass top-[16%] w-full max-w-xl -translate-y-0 gap-0 overflow-hidden rounded-2xl border-white/[0.08] bg-[rgba(20,20,21,0.72)] p-0 shadow-[0_28px_90px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:max-w-xl"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">{uiZh.commandPalette}</DialogTitle>
        <DialogDescription className="sr-only">
          {uiZh.searchDialogDescription}
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <SearchIcon className="size-4 shrink-0 text-white/35" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiZh.searchAnything}
            className="h-8 w-full bg-transparent text-[15px] tracking-tight text-white outline-none placeholder:text-white/30"
            aria-label={uiZh.commandPalette}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-md border border-white/[0.08] px-1.5 py-0.5 text-[10px] tracking-tight text-white/30 sm:inline">
            esc
          </kbd>
        </div>

        <div className="max-h-[min(460px,58vh)] overflow-y-auto px-2 py-2">
          {pending && !loaded ? (
            <p className="px-3 py-8 text-center text-sm text-white/35">
              {uiZh.loading}
            </p>
          ) : null}

          {error ? (
            <p className="px-3 py-8 text-center text-sm text-red-300/80">
              {error}
            </p>
          ) : null}

          {!error && flatItems.length === 0 && loaded ? (
            <p className="px-3 py-8 text-center text-sm text-white/35">
              {query.trim() ? uiZh.noResults : uiZh.noCommandsAvailable}
            </p>
          ) : null}

          {!error && showIdle && recentItems.length > 0 ? (
            <section className="mb-2">
              <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
                {uiZh.recentItems}
              </p>
              <ul>
                {recentItems.map((item, index) => {
                  const active = index === activeIndex;
                  return (
                    <li key={`${item.entityType}:${item.entityId}`}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition duration-150 ease-[var(--riva-ease)]",
                          active
                            ? "bg-white/[0.09] text-white"
                            : "text-white/80 hover:bg-white/[0.045]",
                        )}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() =>
                          selectItem({
                            kind: "recent-item",
                            id: `recent-item:${item.entityType}:${item.entityId}`,
                            item,
                          })
                        }
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium tracking-tight">
                            {item.title}
                          </span>
                          {item.subtitle ? (
                            <span className="mt-0.5 block truncate text-xs text-white/35">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {!error && showIdle
            ? idleGroups.map((group) => (
                <section key={group.id} className="mb-2">
                  <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
                    {searchGroupLabel(group.id, group.label)}
                  </p>
                  <ul>
                    {group.results.map((result) => {
                      const flatIndex = flatItems.findIndex(
                        (item) =>
                          item.kind === "result" && item.id === result.id,
                      );
                      const active = flatIndex === activeIndex;
                      return (
                        <li key={result.id}>
                          <ResultButton
                            result={result}
                            active={active}
                            onActivate={() => setActiveIndex(flatIndex)}
                            onSelect={() =>
                              selectItem({
                                kind: "result",
                                id: result.id,
                                result,
                              })
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            : null}

          {!error && !showIdle
            ? groups.map((group) => (
                <section key={group.id} className="mb-2">
                  <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase">
                    {searchGroupLabel(group.id, group.label)}
                  </p>
                  <ul>
                    {group.results.map((result) => {
                      const flatIndex = flatItems.findIndex(
                        (item) =>
                          item.kind === "result" && item.id === result.id,
                      );
                      const active = flatIndex === activeIndex;
                      return (
                        <li key={result.id}>
                          <ResultButton
                            result={result}
                            active={active}
                            onActivate={() => setActiveIndex(flatIndex)}
                            onSelect={() =>
                              selectItem({
                                kind: "result",
                                id: result.id,
                                result,
                              })
                            }
                          />
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-white/30">
          <span>
            {isMac ? "⌘" : "Ctrl"}K · ↑↓ · Enter · Esc · Tab
            {recentOffset > 0 ? "" : ""}
          </span>
          <span>{uiZh.itemCount(flatItems.length)}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** @alias Project 075 */
export const CommandPaletteDialog = UniversalSearchDialog;
