"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { formatClientStatus } from "@/components/crm/client-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClientAction } from "@/core/actions/client-actions";
import {
  CLIENT_TYPES,
  type Client,
  type ClientStatus,
  type ClientType,
  type Project,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import type { ClientOwnerOption } from "@/features/client/components/create-client-form";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

const EDITABLE_CLIENT_STATUSES = [
  "inquiry",
  "follow_up",
  "confirmed",
  "completed",
  "cancelled",
] as const satisfies readonly ClientStatus[];

const editClientFormSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  ownerId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, uiZh.clientNameRequired).max(160),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  clientType: z.enum(CLIENT_TYPES),
  status: z.enum(EDITABLE_CLIENT_STATUSES),
  followUpAt: z.string().optional(),
  notes: z.string().max(4000).optional(),
});

function clientTypeLabel(type: ClientType): string {
  switch (type) {
    case "wedding":
      return uiZh.weddingMode;
    case "corporate":
      return uiZh.corporateClient;
    case "private":
      return "Private";
    case "others":
      return "Others";
  }
}

type FormValues = z.infer<typeof editClientFormSchema>;

type EditClientFormProps = {
  client: Client;
  projects: Project[];
  owners: ClientOwnerOption[];
};

export function EditClientForm({
  client,
  projects,
  owners,
}: EditClientFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(editClientFormSchema),
    defaultValues: {
      workspaceId: client.workspace_id,
      companyId: client.company_id,
      clientId: client.id,
      projectId: client.project_id ?? "",
      ownerId: client.owner_id ?? "",
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      clientType: client.client_type ?? "wedding",
      status:
        client.status === "archived"
          ? "inquiry"
          : client.status,
      followUpAt: client.follow_up_at ?? "",
      notes: client.notes ?? "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateClientAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            clientId: values.clientId,
            projectId: values.projectId || null,
            ownerId: values.ownerId || null,
            name: values.name,
            email: values.email || null,
            phone: values.phone || null,
            clientType: values.clientType,
            status: values.status,
            followUpAt: values.followUpAt || null,
            notes: values.notes || null,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.clientUpdated);
          router.push(buildWorkspaceOverviewHref("client", values.clientId));
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />
      <input type="hidden" {...form.register("clientId")} />

      <div className="space-y-2">
        <Label htmlFor="edit-client-name">{uiZh.name}</Label>
        <Input
          id="edit-client-name"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-client-type">{uiZh.type}</Label>
          <select
            id="edit-client-type"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("clientType")}
          >
            {CLIENT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#121214]">
                {clientTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-client-status">{uiZh.status}</Label>
          <select
            id="edit-client-status"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("status")}
          >
            {EDITABLE_CLIENT_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#121214]">
                {formatClientStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-client-email">{uiZh.email}</Label>
          <Input
            id="edit-client-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-client-phone">{uiZh.phone}</Label>
          <Input
            id="edit-client-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-client-owner">{uiZh.assignedOwner}</Label>
          <select
            id="edit-client-owner"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("ownerId")}
          >
            <option value="" className="bg-[#121214]">
              Unassigned
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
          <Label htmlFor="edit-client-follow-up">{uiZh.followUpDate}</Label>
          <Input
            id="edit-client-follow-up"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("followUpAt")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-client-project">{uiZh.relatedProjectOptional}</Label>
        <select
          id="edit-client-project"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectId")}
        >
          <option value="" className="bg-[#121214]">
            No project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-[#121214]">
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-client-notes">{uiZh.notes}</Label>
        <textarea
          id="edit-client-notes"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
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
