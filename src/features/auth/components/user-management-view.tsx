"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { uiZh } from "@/config/ui-zh";
import { InvitationsTable } from "@/features/auth/components/invitations-table";
import { InviteUserDialog } from "@/features/auth/components/invite-user-dialog";
import { UsersTable } from "@/features/auth/components/users-table";
import type { InvitationListItem } from "@/features/auth/invite/list-invitations";
import type { ManagedUser } from "@/features/auth/invite/list-managed-users";

export function UserManagementView({
  users,
  invitations,
  initialInviteOpen = false,
}: {
  users: ManagedUser[];
  invitations: InvitationListItem[];
  initialInviteOpen?: boolean;
}) {
  const [inviteOpen, setInviteOpen] = useState(initialInviteOpen);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            {uiZh.userManagementTitle}
          </h1>
          <p className="mt-1 text-sm text-white/45">{uiZh.userManagementDesc}</p>
        </div>
        <Button
          type="button"
          className="bg-white text-black hover:bg-white/90"
          onClick={() => setInviteOpen(true)}
        >
          {uiZh.inviteUser}
        </Button>
      </div>

      <UsersTable users={users} />
      <InvitationsTable invitations={invitations} />

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
