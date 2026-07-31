"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uiZh } from "@/config/ui-zh";
import {
  resendInvitationAction,
  revokeInvitationAction,
} from "@/features/auth/actions/invitation-actions";
import { notifyInvitationDelivery } from "@/features/auth/components/invite-user-fields";
import type { InvitationListItem } from "@/features/auth/invite/list-invitations";
import { INVITE_ROLE_LABELS, type InviteRole } from "@/features/auth/schemas/invite";
import type { InvitationStatus } from "@/types/database";

const statusPresentation: Record<
  InvitationStatus,
  { tone: "warning" | "success" | "default" | "danger"; label: string }
> = {
  pending: { tone: "warning", label: uiZh.inviteStatusPending },
  accepted: { tone: "success", label: uiZh.inviteStatusAccepted },
  expired: { tone: "default", label: uiZh.inviteStatusExpired },
  revoked: { tone: "danger", label: uiZh.inviteStatusRevoked },
};

export function InvitationsTable({
  invitations,
}: {
  invitations: InvitationListItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium tracking-wide text-white/80">
          {uiZh.invitationsSection}
        </h2>
        <p className="mt-1 text-xs text-white/40">
          {uiZh.invitationsSectionDesc}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {invitations.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-white/45">
            {uiZh.noInvitationsYet}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40">{uiZh.name}</TableHead>
                <TableHead className="text-white/40">{uiZh.email}</TableHead>
                <TableHead className="text-white/40">{uiZh.company}</TableHead>
                <TableHead className="text-white/40">{uiZh.role}</TableHead>
                <TableHead className="text-white/40">{uiZh.status}</TableHead>
                <TableHead className="text-white/40">{uiZh.expires}</TableHead>
                <TableHead className="text-right text-white/40">
                  {uiZh.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((row) => {
                const status = statusPresentation[row.status];
                return (
                  <TableRow
                    key={row.id}
                    className="border-white/[0.06] hover:bg-white/[0.03]"
                  >
                    <TableCell className="font-medium text-white/90">
                      {row.full_name}
                    </TableCell>
                    <TableCell className="text-white/70">{row.email}</TableCell>
                    <TableCell className="text-white/70">{row.company}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-white/15 text-white/80"
                      >
                        {INVITE_ROLE_LABELS[row.role as InviteRole]?.zh ??
                          row.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status.tone} label={status.label} />
                    </TableCell>
                    <TableCell className="text-white/55">
                      {new Date(row.expires_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {row.status === "expired" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            className="text-white/70 hover:bg-white/5 hover:text-white"
                            onClick={() => {
                              startTransition(async () => {
                                const result = await resendInvitationAction(
                                  row.id,
                                );
                                if (!result.ok) {
                                  toast.error(result.error);
                                  return;
                                }
                                notifyInvitationDelivery(result.data);
                                router.refresh();
                              });
                            }}
                          >
                            {uiZh.resend}
                          </Button>
                        ) : null}
                        {row.status === "pending" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={pending}
                            className="text-white/70 hover:bg-white/5 hover:text-white"
                            onClick={() => {
                              startTransition(async () => {
                                const result = await revokeInvitationAction(
                                  row.id,
                                );
                                if (!result.ok) {
                                  toast.error(result.error);
                                  return;
                                }
                                toast.success(uiZh.invitationCancelled);
                                router.refresh();
                              });
                            }}
                          >
                            {uiZh.cancel}
                          </Button>
                        ) : null}
                        {row.status === "accepted" ||
                        row.status === "revoked" ? (
                          <span className="px-2 text-xs text-white/30">
                            {uiZh.emDash}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
