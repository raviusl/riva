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
import { uiZh } from "@/config/ui-zh";
import { createMeetingAction } from "@/core/actions/meeting-actions";
import {
  MEETING_STATUSES,
  MEETING_TYPES,
  type Client,
  type Project,
  type Vendor,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import type { MeetingOwnerOption } from "@/features/meeting/lib/meeting-owners";
import { parseParticipantLines } from "@/features/meeting/lib/meeting-participants";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  clientId: z.string().uuid().optional().or(z.literal("")),
  ownerId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(1, uiZh.titleRequired).max(200),
  meetingType: z.enum(MEETING_TYPES),
  status: z.enum(MEETING_STATUSES),
  meetingDate: z.string().min(1, uiZh.dateRequired),
  meetingTime: z.string().min(1, uiZh.timeRequired),
  durationMinutes: z.number().int().min(15).max(1440),
  location: z.string().max(300).optional(),
  googleMeetLink: z.string().max(500).optional(),
  notes: z.string().max(8000).optional(),
  internalNotes: z.string().max(8000).optional(),
  participantsRaw: z.string().optional(),
  vendorIds: z.array(z.string().uuid()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateMeetingFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
  clients: Client[];
  vendors: Vendor[];
  owners: MeetingOwnerOption[];
  defaultProjectId?: string;
  defaultClientId?: string;
  defaultOwnerId?: string;
  returnTo?: string;
};

export function CreateMeetingForm({
  workspaceId,
  companyId,
  projects,
  clients,
  vendors,
  owners,
  defaultProjectId = "",
  defaultClientId = "",
  defaultOwnerId = "",
  returnTo = "/dashboard/meetings",
}: CreateMeetingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId,
      companyId,
      projectId: defaultProjectId,
      clientId: defaultClientId,
      ownerId: defaultOwnerId,
      title: "",
      meetingType: "consultation",
      status: "scheduled",
      meetingDate: new Date().toISOString().slice(0, 10),
      meetingTime: "10:00",
      durationMinutes: 60,
      location: "",
      googleMeetLink: "",
      notes: "",
      internalNotes: "",
      participantsRaw: "",
      vendorIds: [],
    },
  });

  const selectedVendors = form.watch("vendorIds") ?? [];

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createMeetingAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId || null,
            clientId: values.clientId || null,
            vendorIds: values.vendorIds ?? [],
            ownerId: values.ownerId || null,
            title: values.title,
            meetingType: values.meetingType,
            status: values.status,
            meetingDate: values.meetingDate,
            meetingTime: values.meetingTime,
            durationMinutes: values.durationMinutes,
            location: values.location || null,
            googleMeetLink: values.googleMeetLink || null,
            notes: values.notes || null,
            internalNotes: values.internalNotes || null,
            participants: parseParticipantLines(values.participantsRaw ?? ""),
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.meetingCreated);
          const destination =
            returnTo !== "/dashboard/meetings"
              ? returnTo
              : buildWorkspaceOverviewHref("meeting", result.data.meetingId);
          router.push(destination);
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />

      <div className="space-y-2">
        <Label htmlFor="meeting-title">{uiZh.titleLabel}</Label>
        <Input
          id="meeting-title"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meeting-type">{uiZh.type}</Label>
          <select
            id="meeting-type"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("meetingType")}
          >
            {MEETING_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#121214]">
                {meetingTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting-status">{uiZh.status}</Label>
          <select
            id="meeting-status"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("status")}
          >
            {MEETING_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#121214]">
                {meetingStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="meeting-date">{uiZh.date}</Label>
          <Input
            id="meeting-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("meetingDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting-time">{uiZh.time}</Label>
          <Input
            id="meeting-time"
            type="time"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("meetingTime")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting-duration">{uiZh.durationMinutes}</Label>
          <Input
            id="meeting-duration"
            type="number"
            min={15}
            step={15}
            className={authFieldClassName}
            disabled={pending}
            {...form.register("durationMinutes", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meeting-location">{uiZh.location}</Label>
          <Input
            id="meeting-location"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("location")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting-meet-link">{uiZh.googleMeetLink}</Label>
          <Input
            id="meeting-meet-link"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("googleMeetLink")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meeting-project">{uiZh.relatedProject}</Label>
          <select
            id="meeting-project"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("projectId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.none}
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="meeting-client">{uiZh.relatedClient}</Label>
          <select
            id="meeting-client"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("clientId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.none}
            </option>
            {clients
              .filter((client) => client.status !== "archived")
              .map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                  className="bg-[#121214]"
                >
                  {client.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-owner">{uiZh.assignedOwner}</Label>
        <select
          id="meeting-owner"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("ownerId")}
        >
          <option value="" className="bg-[#121214]">
            {uiZh.unassigned}
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
        <Label>{uiZh.relatedVendors}</Label>
        {vendors.filter((vendor) => vendor.status !== "archived").length ===
        0 ? (
          <p className="text-xs text-white/45">{uiZh.noVendorsAvailable}</p>
        ) : (
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3">
            {vendors
              .filter((vendor) => vendor.status !== "archived")
              .map((vendor) => {
                const checked = selectedVendors.includes(vendor.id);
                return (
                  <label
                    key={vendor.id}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-white/20"
                      checked={checked}
                      disabled={pending}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...selectedVendors, vendor.id]
                          : selectedVendors.filter((id) => id !== vendor.id);
                        form.setValue("vendorIds", next, {
                          shouldDirty: true,
                        });
                      }}
                    />
                    {vendor.name}
                  </label>
                );
              })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-participants">{uiZh.participants}</Label>
        <textarea
          id="meeting-participants"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          placeholder={uiZh.participantsPlaceholder}
          disabled={pending}
          {...form.register("participantsRaw")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-notes">{uiZh.notes}</Label>
        <textarea
          id="meeting-notes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("notes")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting-internal-notes">{uiZh.internalNotes}</Label>
        <textarea
          id="meeting-internal-notes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("internalNotes")}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? uiZh.creating : uiZh.createMeeting}
      </Button>
    </form>
  );
}
