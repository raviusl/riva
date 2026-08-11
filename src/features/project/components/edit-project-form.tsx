"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectAction } from "@/core/actions/project-actions";
import { PROJECT_TYPES, type Project } from "@/core/types";
import type { ClientOwnerOption } from "@/features/client/components/create-client-form";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { uiZh } from "@/config/ui-zh";

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseOptionalUuid(value: string | null | undefined): string | null {
  return emptyToNull(value);
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

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, uiZh.projectNameRequired).max(160),
  projectType: z.enum(PROJECT_TYPES).optional(),
  venue: z.string().max(300).optional(),
  ballroom: z.string().max(300).optional(),
  weddingDate: z.string().optional(),
  expectedPax: z.string().optional(),
  clientBudget: z.string().optional(),
  plannerId: z.string().optional(),
  coordinatorId: z.string().optional(),
  salesId: z.string().optional(),
  notes: z.string().max(4000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type EditProjectFormProps = {
  project: Project;
  owners: ClientOwnerOption[];
};

export function EditProjectForm({ project, owners }: EditProjectFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: project.workspace_id,
      companyId: project.company_id,
      projectId: project.id,
      name: project.name,
      projectType: project.project_type ?? "other",
      venue: project.venue ?? "",
      ballroom: project.ballroom ?? "",
      weddingDate: project.wedding_date ?? "",
      expectedPax:
        project.expected_pax != null ? String(project.expected_pax) : "",
      clientBudget:
        project.client_budget != null ? String(project.client_budget) : "",
      plannerId: project.planner_id ?? "",
      coordinatorId: project.coordinator_id ?? "",
      salesId: project.sales_id ?? "",
      notes: project.notes ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateProjectAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId,
            name: values.name,
            projectType: values.projectType,
            status: project.status === "archived" ? "planning" : project.status,
            venue: emptyToNull(values.venue),
            ballroom: emptyToNull(values.ballroom),
            weddingDate: emptyToNull(values.weddingDate),
            expectedPax: parseOptionalInt(values.expectedPax),
            clientBudget: parseOptionalNumber(values.clientBudget),
            plannerId: parseOptionalUuid(values.plannerId),
            coordinatorId: parseOptionalUuid(values.coordinatorId),
            salesId: parseOptionalUuid(values.salesId),
            notes: emptyToNull(values.notes),
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.projectUpdated);
          router.push(`/dashboard/projects/${project.id}`);
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />
      <input type="hidden" {...form.register("projectId")} />

      <div className="space-y-2">
        <Label htmlFor="edit-project-name">{uiZh.projectName}</Label>
        <Input
          id="edit-project-name"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-type">{uiZh.type}</Label>
        <select
          id="edit-project-type"
          className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectType")}
        >
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#121214]">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-project-venue">{uiZh.venue}</Label>
          <Input
            id="edit-project-venue"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("venue")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-project-ballroom">{uiZh.ballroom}</Label>
          <Input
            id="edit-project-ballroom"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("ballroom")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-project-wedding-date">{uiZh.weddingDate}</Label>
          <Input
            id="edit-project-wedding-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("weddingDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-project-expected-pax">{uiZh.expectedPax}</Label>
          <Input
            id="edit-project-expected-pax"
            type="number"
            min={0}
            className={authFieldClassName}
            disabled={pending}
            {...form.register("expectedPax")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-client-budget">{uiZh.clientBudget}</Label>
        <Input
          id="edit-project-client-budget"
          type="number"
          min={0}
          step="0.01"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("clientBudget")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="edit-project-planner">{uiZh.planner}</Label>
          <select
            id="edit-project-planner"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("plannerId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.emDash}
            </option>
            {owners.map((owner) => (
              <option
                key={owner.userId}
                value={owner.userId}
                className="bg-[#121214]"
              >
                {owner.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-project-coordinator">{uiZh.coordinator}</Label>
          <select
            id="edit-project-coordinator"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("coordinatorId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.emDash}
            </option>
            {owners.map((owner) => (
              <option
                key={owner.userId}
                value={owner.userId}
                className="bg-[#121214]"
              >
                {owner.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-project-sales">{uiZh.salesPersonLabel}</Label>
          <select
            id="edit-project-sales"
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("salesId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.emDash}
            </option>
            {owners.map((owner) => (
              <option
                key={owner.userId}
                value={owner.userId}
                className="bg-[#121214]"
              >
                {owner.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-notes">{uiZh.notes}</Label>
        <textarea
          id="edit-project-notes"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("notes")}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? uiZh.saving : uiZh.saveChanges}
      </Button>
    </form>
  );
}
