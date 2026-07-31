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
import { updateMeetingAction } from "@/core/actions/meeting-actions";
import {
  MEETING_STATUSES,
  MEETING_TYPES,
  type Client,
  type Meeting,
  type Project,
  type Vendor,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  meetingStatusLabel,
  meetingTypeLabel,
} from "@/features/meeting/lib/meeting-labels";
import type { MeetingOwnerOption } from "@/features/meeting/lib/meeting-owners";
import {
  parseParticipantLines,
  serializeParticipants,
} from "@/features/meeting/lib/meeting-participants";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  meetingId: z.string().uuid(),
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

type EditMeetingFormProps = {
  meeting: Meeting;
  projects: Project[];
  clients: Client[];
  vendors: Vendor[];
  owners: MeetingOwnerOption[];
};

export function EditMeetingForm({
  meeting,
  projects,
  clients,
  vendors,
  owners,
}: EditMeetingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: meeting.workspace_id,
      companyId: meeting.company_id,
      meetingId: meeting.id,
      projectId: meeting.project_id ?? "",
      clientId: meeting.client_id ?? "",
      ownerId: meeting.owner_id ?? "",
      title: meeting.title,
      meetingType: meeting.meeting_type,
      status: meeting.status,
      meetingDate: meeting.meeting_date,
      meetingTime: meeting.meeting_time,
      durationMinutes: meeting.duration_minutes,
      location: meeting.location ?? "",
      googleMeetLink: meeting.google_meet_link ?? "",
      notes: meeting.notes ?? "",
      internalNotes: meeting.internal_notes ?? "",
      participantsRaw: serializeParticipants(meeting.participants),
      vendorIds: meeting.vendor_ids,
    },
  });

  const selectedVendors = form.watch("vendorIds") ?? [];

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateMeetingAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            meetingId: values.meetingId,
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
          toast.success(uiZh.meetingUpdated);
          router.push(buildWorkspaceOverviewHref("meeting", meeting.id));
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />
      <input type="hidden" {...form.register("meetingId")} />

      <div className="space-y-2">
        <Label htmlFor="edit-meeting-title">{uiZh.titleLabel}</Label>
        <Input
          id="edit-meeting-title"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("title")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-meeting-type">{uiZh.type}</Label>
          <select
            id="edit-meeting-type"
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
          <Label htmlFor="edit-meeting-status">{uiZh.status}</Label>
          <select
            id="edit-meeting-status"
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
          <Label htmlFor="edit-meeting-date">{uiZh.date}</Label>
          <Input
            id="edit-meeting-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("meetingDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-meeting-time">{uiZh.time}</Label>
          <Input
            id="edit-meeting-time"
            type="time"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("meetingTime")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-meeting-duration">{uiZh.durationMinutes}</Label>
          <Input
            id="edit-meeting-duration"
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
          <Label htmlFor="edit-meeting-location">{uiZh.location}</Label>
          <Input
            id="edit-meeting-location"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("location")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-meeting-meet-link">{uiZh.googleMeetLink}</Label>
          <Input
            id="edit-meeting-meet-link"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("googleMeetLink")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-meeting-project">{uiZh.relatedProject}</Label>
          <select
            id="edit-meeting-project"
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
          <Label htmlFor="edit-meeting-client">{uiZh.relatedClient}</Label>
          <select
            id="edit-meeting-client"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("clientId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.none}
            </option>
            {clients.map((client) => (
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
        <Label htmlFor="edit-meeting-owner">{uiZh.assignedOwner}</Label>
        <select
          id="edit-meeting-owner"
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
        <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3">
          {vendors.map((vendor) => {
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
                    form.setValue("vendorIds", next, { shouldDirty: true });
                  }}
                />
                {vendor.name}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-meeting-participants">{uiZh.participants}</Label>
        <textarea
          id="edit-meeting-participants"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          placeholder={uiZh.participantsPlaceholder}
          disabled={pending}
          {...form.register("participantsRaw")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-meeting-notes">{uiZh.notes}</Label>
        <textarea
          id="edit-meeting-notes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("notes")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-meeting-internal-notes">{uiZh.internalNotes}</Label>
        <textarea
          id="edit-meeting-internal-notes"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("internalNotes")}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? uiZh.saving : uiZh.saveChanges}
      </Button>
    </form>
  );
}
