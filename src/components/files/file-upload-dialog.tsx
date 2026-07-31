"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  detectFileFoundationType,
  fileExtensionFromName,
  formatFileSize,
} from "@/components/files/file-labels";
import { upsertProjectFiles } from "@/components/files/file-store";
import type { ProjectFile } from "@/components/files/file-types";
import { FILE_FOUNDATION_ACCEPT } from "@/components/files/file-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Uploader } from "@/components/ui/uploader";
import { uiZh } from "@/config/ui-zh";
import { DEFAULT_MAX_FILE_SIZE_BYTES } from "@/core/storage/constants";
import type { Project } from "@/core/types";
import { cn } from "@/lib/utils";

type FileUploadDialogProps = {
  workspaceId: string;
  companyId: string;
  projects: Pick<Project, "id" | "name">[];
  uploaderId: string;
  uploaderName: string;
  defaultProjectId?: string;
};

type PendingUpload = {
  localId: string;
  file: File;
  progress: number;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

const selectClassName =
  "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-40";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function simulateUpload(
  onProgress: (value: number) => void,
): Promise<void> {
  let value = 0;
  while (value < 100) {
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 120));
    value = Math.min(100, value + 8 + Math.floor(Math.random() * 18));
    onProgress(value);
  }
}

export function FileUploadDialog({
  workspaceId,
  companyId,
  projects,
  uploaderId,
  uploaderName,
  defaultProjectId = "",
}: FileUploadDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [busy, startTransition] = useTransition();

  function reset() {
    setPending([]);
    setProjectId(defaultProjectId);
  }

  function handleFilesChange(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const next: PendingUpload[] = [];
    for (const file of Array.from(fileList)) {
      const extension = fileExtensionFromName(file.name);
      const type = detectFileFoundationType(file.type, extension);
      if (!type) {
        toast.error(uiZh.fileUnsupportedType(file.name));
        continue;
      }
      if (file.size > DEFAULT_MAX_FILE_SIZE_BYTES) {
        toast.error(uiZh.fileExceedsLimit(file.name));
        continue;
      }
      next.push({
        localId: createId(),
        file,
        progress: 0,
        status: "queued",
      });
    }
    if (next.length === 0) return;
    setPending((prev) => [...prev, ...next]);
  }

  function handleUpload() {
    if (!projectId) {
      toast.error(uiZh.selectAProject);
      return;
    }
    const project = projects.find((row) => row.id === projectId);
    if (!project) {
      toast.error(uiZh.projectNotFound);
      return;
    }
    if (pending.length === 0) {
      toast.error(uiZh.chooseAtLeastOneFile);
      return;
    }

    startTransition(async () => {
      const created: ProjectFile[] = [];

      for (const item of pending) {
        if (item.status === "done") continue;
        setPending((prev) =>
          prev.map((row) =>
            row.localId === item.localId
              ? { ...row, status: "uploading", progress: 0, error: undefined }
              : row,
          ),
        );

        try {
          await simulateUpload((progress) => {
            setPending((prev) =>
              prev.map((row) =>
                row.localId === item.localId
                  ? { ...row, progress, status: "uploading" }
                  : row,
              ),
            );
          });

          const extension = fileExtensionFromName(item.file.name);
          const type = detectFileFoundationType(item.file.type, extension);
          if (!type) {
            throw new Error(uiZh.unsupportedType);
          }

          const record: ProjectFile = {
            id: createId(),
            workspaceId,
            companyId,
            projectId: project.id,
            projectName: project.name,
            name: item.file.name,
            type,
            mimeType: item.file.type || "application/octet-stream",
            extension,
            size: item.file.size,
            uploadedById: uploaderId,
            uploadedByName: uploaderName,
            uploadedAt: new Date().toISOString(),
            description: null,
          };
          created.push(record);

          setPending((prev) =>
            prev.map((row) =>
              row.localId === item.localId
                ? { ...row, progress: 100, status: "done" }
                : row,
            ),
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : uiZh.uploadFailed;
          setPending((prev) =>
            prev.map((row) =>
              row.localId === item.localId
                ? { ...row, status: "error", error: message }
                : row,
            ),
          );
        }
      }

      if (created.length === 0) {
        toast.error(uiZh.noFilesUploaded);
        return;
      }

      upsertProjectFiles(workspaceId, companyId, created);
      toast.success(
        created.length === 1
          ? uiZh.fileUploaded
          : uiZh.filesUploaded(created.length),
      );
      setOpen(false);
      reset();
      if (created.length === 1) {
        router.push(`/dashboard/files/${created[0].id}`);
      }
      router.refresh();
    });
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {uiZh.uploadFileButton}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{uiZh.uploadFile}</DialogTitle>
            <DialogDescription className="text-white/45">
              {uiZh.uploadFileDesc}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-project">{uiZh.projects}</Label>
              <select
                id="file-project"
                className={selectClassName}
                disabled={busy || projects.length === 0}
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="" className="bg-[#121214]">
                  {uiZh.selectProject}
                </option>
                {projects.map((project) => (
                  <option
                    key={project.id}
                    value={project.id}
                    className="bg-[#121214]"
                  >
                    {project.name}
                  </option>
                ))}
              </select>
              {projects.length === 0 ? (
                <p className="text-xs text-white/40">
                  {uiZh.createProjectBeforeFiles}
                </p>
              ) : null}
            </div>

            <Uploader
              accept={FILE_FOUNDATION_ACCEPT}
              multiple
              disabled={busy || projects.length === 0}
              label={uiZh.dropFilesHere}
              hint={uiZh.orClickToBrowse}
              onFilesChange={handleFilesChange}
              className={cn(
                "border-white/[0.12] bg-white/[0.03] text-white",
                "[&_span]:text-white/80 [&_.text-muted-foreground]:text-white/40",
                "[&_.bg-background]:bg-white/[0.06] [&_.text-foreground]:text-white",
              )}
            />

            {pending.length > 0 ? (
              <ul className="space-y-3">
                {pending.map((item) => (
                  <li
                    key={item.localId}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/85">
                          {item.file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {formatFileSize(item.file.size)}
                          {item.status === "error" && item.error
                            ? ` · ${item.error}`
                            : null}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs tabular-nums text-white/45">
                        {item.status === "done"
                          ? uiZh.done
                          : item.status === "error"
                            ? uiZh.failed
                            : `${item.progress}%`}
                      </p>
                    </div>
                    <Progress
                      value={item.progress}
                      className="mt-2 w-full [&>div]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-white"
                    />
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
              >
                {uiZh.cancel}
              </Button>
              <Button
                type="button"
                disabled={
                  busy ||
                  projects.length === 0 ||
                  !projectId ||
                  pending.length === 0
                }
                onClick={handleUpload}
              >
                {busy ? uiZh.uploading : uiZh.upload}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
