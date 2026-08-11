"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  formatProjectStatus,
  PROJECT_FOUNDATION_STATUSES,
} from "@/components/projects/project-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import { createProjectAction } from "@/core/actions/project-actions";
import type { Client } from "@/core/types";

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseOptionalInt(value: string | null | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalNumber(value: string | null | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, uiZh.projectNameRequired).max(160),
    clientId: z.string().uuid().optional().or(z.literal("")),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    venue: z.string().max(300).optional().or(z.literal("")),
    ballroom: z.string().max(300).optional().or(z.literal("")),
    weddingDate: z.string().optional().or(z.literal("")),
    expectedPax: z.string().optional().or(z.literal("")),
    clientBudget: z.string().optional().or(z.literal("")),
    notes: z.string().max(4000).optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    status: z.enum(PROJECT_FOUNDATION_STATUSES),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: uiZh.dateFormatHint,
      });
    }
    if (values.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.endDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: uiZh.dateFormatHint,
      });
    }
    if (values.weddingDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.weddingDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["weddingDate"],
        message: uiZh.dateFormatHint,
      });
    }
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: uiZh.endDateAfterStart,
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

type ProjectFormProps = {
  workspaceId: string;
  companyId: string;
  clients: Client[];
  defaultClientId?: string | null;
  defaultName?: string;
  defaultWeddingDate?: string | null;
  onSuccess?: (projectId: string) => void;
  onCancel?: () => void;
};

export function ProjectForm({
  workspaceId,
  companyId,
  clients,
  defaultClientId,
  defaultName,
  defaultWeddingDate,
  onSuccess,
  onCancel,
}: ProjectFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: defaultName ?? "",
      clientId: defaultClientId ?? "",
      description: "",
      venue: "",
      ballroom: "",
      weddingDate: defaultWeddingDate ?? "",
      expectedPax: "",
      clientBudget: "",
      notes: "",
      startDate: "",
      endDate: "",
      status: "inquiry",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const weddingDate = emptyToNull(values.weddingDate);
          const result = await createProjectAction({
            workspaceId,
            companyId,
            name: values.name,
            description: emptyToNull(values.description),
            clientId: values.clientId || null,
            startDate: emptyToNull(values.startDate),
            endDate: emptyToNull(values.endDate),
            weddingDate,
            eventDate: weddingDate,
            venue: emptyToNull(values.venue),
            ballroom: emptyToNull(values.ballroom),
            expectedPax: parseOptionalInt(values.expectedPax),
            clientBudget: parseOptionalNumber(values.clientBudget),
            notes: emptyToNull(values.notes),
            projectType: "wedding",
            status: values.status,
          });

          if (!result.ok) {
            toast.error(result.error);
            return;
          }

          toast.success(uiZh.projectCreated);
          form.reset();
          if (onSuccess) {
            onSuccess(result.data.projectId);
          } else {
            router.push(`/dashboard/projects/${result.data.projectId}`);
          }
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="project-name">{uiZh.projectName}</Label>
        <Input
          id="project-name"
          placeholder={uiZh.projectName}
          disabled={pending}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-300/90">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-client">{uiZh.client}</Label>
        <select
          id="project-client"
          className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-40"
          disabled={pending}
          {...form.register("clientId")}
        >
          <option value="" className="bg-[#121214]">
            {uiZh.noClient}
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id} className="bg-[#121214]">
              {client.display_name || client.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-venue">{uiZh.venue}</Label>
          <Input
            id="project-venue"
            disabled={pending}
            {...form.register("venue")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-ballroom">{uiZh.ballroom}</Label>
          <Input
            id="project-ballroom"
            disabled={pending}
            {...form.register("ballroom")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-wedding-date">{uiZh.weddingDate}</Label>
          <Input
            id="project-wedding-date"
            type="date"
            disabled={pending}
            {...form.register("weddingDate")}
          />
          {form.formState.errors.weddingDate ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.weddingDate.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-expected-pax">{uiZh.expectedPax}</Label>
          <Input
            id="project-expected-pax"
            type="number"
            min={0}
            disabled={pending}
            {...form.register("expectedPax")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-client-budget">{uiZh.clientBudget}</Label>
        <Input
          id="project-client-budget"
          type="number"
          min={0}
          step="0.01"
          disabled={pending}
          {...form.register("clientBudget")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-description">{uiZh.description}</Label>
        <Textarea
          id="project-description"
          placeholder={uiZh.optionalDescription}
          disabled={pending}
          {...form.register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-notes">{uiZh.notes}</Label>
        <Textarea
          id="project-notes"
          disabled={pending}
          {...form.register("notes")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="project-start">{uiZh.startDate}</Label>
          <Input
            id="project-start"
            type="date"
            disabled={pending}
            {...form.register("startDate")}
          />
          {form.formState.errors.startDate ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.startDate.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-end">{uiZh.endDate}</Label>
          <Input
            id="project-end"
            type="date"
            disabled={pending}
            {...form.register("endDate")}
          />
          {form.formState.errors.endDate ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-status">{uiZh.status}</Label>
        <select
          id="project-status"
          className="h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-40"
          disabled={pending}
          {...form.register("status")}
        >
          {PROJECT_FOUNDATION_STATUSES.map((status) => (
            <option key={status} value={status} className="bg-[#121214]">
              {formatProjectStatus(status)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            {uiZh.cancel}
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? uiZh.creating : uiZh.createProject}
        </Button>
      </div>
    </form>
  );
}
